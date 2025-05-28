'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { Message } from '@/types/chat';

interface SocketContextType {
  socketRef: React.RefObject<Socket | null>;
  isIdentified: boolean;
  messages: Message[]; // current room messages only
  currentRoom: string | null;
  user: {
    id: string;
    name: string;
    phoneNumber: string;
  };
  sendMessage: (content: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [isIdentified, setIsIdentified] = useState(false);
  const [user, setUser] = useState({
    id: '',
    name: '',
    phoneNumber: '',
  });
  const [currentRoom, setCurrentRoom] = useState<string | null>('general');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (socketRef.current) {
      console.log('Socket already exists, disconnecting old connection');
      socketRef.current.disconnect();
    }

    const socket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: false,
      autoConnect: false,
    });

    socketRef.current = socket;
    socket.connect();

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join-room', 'general');
    });

    socket.on('room-joined', (roomId: string) => {
      console.log('Room joined:', roomId);
      setCurrentRoom(roomId);
    });

    socket.on('room-left', () => {
      console.log('Room left');
      setCurrentRoom(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setUser({ id: '', name: '', phoneNumber: '' });
      setIsIdentified(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    socket.on('identification-confirmed', (userData) => {
      console.log('Identification confirmed:', userData);
      const socketId = socketRef.current?.id || '';
      setUser({
        id: socketId,
        name: userData.name,
        phoneNumber: userData.phoneNumber || '',
      });
      setIsIdentified(true);
    });

    socket.on('message', (msg: Message) => {
      console.log('Received message:', msg);
      const isFromThisClient = msg.sender.id === socketRef.current?.id;

      setMessagesMap((prev) => {
        const roomMessages = prev[msg.room] || [];
        return {
          ...prev,
          [msg.room]: [...roomMessages, { ...msg, isOwn: isFromThisClient }],
        };
      });
    });

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const joinRoom = (roomId: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit('join-room', roomId);
  };

  const leaveRoom = () => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit('leave-room');
  };

  const sendMessage = (content: string) => {
    if (!isIdentified || !currentRoom) return;

    const socket = socketRef.current;
    if (!socket || !socket.connected) return;

    socket.emit('send-message', {
      content,
      room: currentRoom,
      sender: user,
      timestamp: new Date().toISOString(),
    });
  };

  const currentMessages = currentRoom ? messagesMap[currentRoom] || [] : [];

  return (
    <SocketContext.Provider
      value={{
        socketRef,
        isIdentified,
        messages: currentMessages,
        currentRoom,
        user,
        sendMessage,
        joinRoom,
        leaveRoom,
      }}
    >
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
