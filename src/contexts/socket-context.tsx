'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { Message, User } from '@/services/api.service';
import { useAuth } from '@/hooks/useAuth';
import apiService from '@/services/api.service';

interface SocketContextType {
  socketRef: React.RefObject<Socket | null>;
  isIdentified: boolean;
  messages: Message[];
  currentRoomId: number | null;
  user: User | null;
  sendMessage: (content: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  createGroup: (groupName: string) => Promise<void>;
  error: string | null;
  initialized: boolean;
}

const EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  IDENTIFICATION_CONFIRMED: 'identification-confirmed',
  ROOM_JOINED: 'room-joined',
  ROOM_LEFT: 'room-left',
  MESSAGE: 'message',
  ROOM_HISTORY: 'room-history',
};

const SocketContext = createContext<SocketContextType | null>(null);

const formatMessage = (msg: Message, currentUserId?: string): Message => ({
  ...msg,
  createdAt: msg.createdAt || new Date().toISOString(),
  roomId: msg.roomId,
  isOwn: msg.senderId === currentUserId,
  senderId: msg.senderId,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const authUser = useAuth();
  const [messagesMap, setMessagesMap] = useState<Record<number, Message[]>>({});
  const [isIdentified, setIsIdentified] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const userRef = useRef<User | null>(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: false,
    });

    socketRef.current = socket;

    socket.on(EVENTS.CONNECT, async () => {
      console.log('Socket connected:', socket.id);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found');
        setInitialized(true);
        return;
      }

      try {
        await apiService.getUsers(); // validate user token
        setError(null);
        setIsIdentified(true);
        setInitialized(true);
        socket.emit('identify', {
          name: authUser?.name,
          phoneNumber: authUser?.phoneNumber,
        });
      } catch (err) {
        console.error('Authentication failed:', err);
        setError('Authentication failed');
        setIsIdentified(false);
        setInitialized(true);
      }
    });

    socket.on(EVENTS.DISCONNECT, (reason) => {
      console.log('Socket disconnected:', reason);
      setIsIdentified(false);
      setUser(null);
      setCurrentRoom(null);
    });

    socket.on(EVENTS.CONNECT_ERROR, (err) => {
      console.error('Socket connection error:', err);
      setError('Socket connection error');
      setInitialized(true);
    });

    socket.on(EVENTS.IDENTIFICATION_CONFIRMED, (userData: User) => {
      console.log('Identification confirmed:', userData);
      setUser(userData);
      setIsIdentified(true);
    });

    socket.on(EVENTS.ROOM_JOINED, async (roomId: number) => {
      console.log('Room joined:', roomId);
      setCurrentRoom(roomId);
    });

    socket.on(EVENTS.ROOM_HISTORY, (messages: Message[], roomId: number) => {
      console.log(`Received message history for room ${roomId}:`, messages);
    
      const formattedMessages = messages?.map((msg) =>
        formatMessage(msg, userRef.current?.id)
      );
    
      setMessagesMap((prev) => ({
        ...prev,
        [roomId]: formattedMessages,
      }));
    });
    

    socket.on(EVENTS.ROOM_LEFT, () => {
      console.log('Room left');
      setCurrentRoom(null);
    });

    socket.on(EVENTS.MESSAGE, (msg: Message) => {
      setMessagesMap((prev) => {
        const roomMessages = prev[msg.roomId] || [];
        return {
          ...prev,
          [msg.roomId]: [...roomMessages, formatMessage(msg, userRef.current?.id)],
        };
      });
    });

    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinRoom = (roomId: string) => {
    const socket = socketRef.current;
    const token = localStorage.getItem('token')
    if (!socket || !socket.connected) return;
    socket.emit('join-room', roomId, token);
  };

  const leaveRoom = () => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit('leave-room');
  };

  const sendMessage = async (content: string) => {
    const socket = socketRef.current;
    const sender = userRef.current;
    const roomId = currentRoom;

    if (!socket || !socket.connected || !sender || !roomId) return;

    try {
      const createdAt = new Date().toISOString();
      const message = {
        content,
        senderId: sender.id,
        roomId,
        createdAt,
      };

      await apiService.createMessage(message);
      socket.emit('message', message);

      setMessagesMap((prev) => {
        const roomMessages = prev[roomId] || [];
        return {
          ...prev,
          [roomId]: [...roomMessages, { ...message, isOwn: true }],
        };
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const createGroup = async (groupName: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected || !userRef.current) return;

    try {
      const group = await apiService.createGroup({
        name: groupName,
        isActive: true,
        members: [],
      });
      joinRoom(group.id.toString());
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group');
    }
  };

  const currentMessages = currentRoom ? messagesMap[currentRoom] || [] : [];

  const contextValue = useMemo<SocketContextType>(
    () => ({
      socketRef,
      isIdentified,
      messages: currentMessages,
      currentRoomId: currentRoom,
      user,
      sendMessage,
      joinRoom,
      leaveRoom,
      createGroup,
      error,
      initialized,
    }),
    [isIdentified, currentMessages, currentRoom, user, error, initialized]
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
