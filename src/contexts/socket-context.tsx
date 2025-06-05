"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { io, type Socket } from "socket.io-client";
import { Message, User } from "@/services/api.service";
import { useAuth } from "@/hooks/useAuth";
import apiService from "@/services/api.service";
import { promises } from "dns";

interface SocketContextType {
  socketRef: React.RefObject<Socket | null>;
  isIdentified: boolean;
  messages: Message[];
  currentRoomId: number | null;
  currentMessages: Message[];
  user: User | null;
  sendMessage: (content: string) => void;
  joinRoom: (roomId: string) => void;
  saveVoiceRecord: (file: File, duration: number, mimeType: string, conversationId?: string) => Promise<void>;
  // leaveRoom: (roomId: number) => void;
  createGroup: (groupName: string) => Promise<void>;
  error: string | null;
  initialized: boolean;
  lastMessages: Record<number, { message: string; time: string }>;
}

const EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
  IDENTIFICATION_CONFIRMED: "identification-confirmed",
  ROOM_JOINED: "room-joined",
  ROOM_LEFT: "room-left",
  MESSAGE: "message",
  ROOM_HISTORY: "room-history",
};

const SocketContext = createContext<SocketContextType | null>(null);

const formatMessage = (msg: Message, currentUserId?: string): Message => ({
  ...msg,
  timestamp: msg.timestamp || new Date().toISOString(),
  roomId: msg.roomId,
  isOwn: msg.sender.id === currentUserId,
  sender: msg.sender,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const authUser = useAuth();
  const [messagesMap, setMessagesMap] = useState<Record<number, Message[]>>({});
  const [isIdentified, setIsIdentified] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<number | null>(null);
  const [lastMessages, setLastMessages] = useState<
    Record<number, { message: string; time: string }>
  >({});
  const socketRef = useRef<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const userRef = useRef<User | null>(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const socket = io("http://localhost:3001", {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: false,
    });

    socketRef.current = socket;

    socket.on(EVENTS.CONNECT, async () => {
      console.log("Socket connected:", socket.id);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found");
        setInitialized(true);
        return;
      }

      try {
        await apiService.getUsers(); // validate user token
        setError(null);
        setIsIdentified(true);
        setInitialized(true);
        socket.emit("identify", {
          name: authUser?.name,
          phoneNumber: authUser?.phoneNumber,
        });
      } catch (err) {
        console.error("Authentication failed:", err);
        setError("Authentication failed");
        setIsIdentified(false);
        setInitialized(true);
      }
    });

    socket.on(EVENTS.DISCONNECT, (reason) => {
      console.log("Socket disconnected:", reason);
      setIsIdentified(false);
      setUser(null);
      setCurrentRoom(null);
    });

    socket.on(EVENTS.CONNECT_ERROR, (err) => {
      console.error("Socket connection error:", err);
      setError("Socket connection error");
      setInitialized(true);
    });

    socket.on(EVENTS.IDENTIFICATION_CONFIRMED, (userData: User) => {
      console.log("Identification confirmed:", userData);
      setUser(userData);
      setIsIdentified(true);
    });

    socket.on(EVENTS.ROOM_JOINED, async (roomId: number) => {
      console.log("Room joined:", roomId);
      try {
        // Request room history after joining
        socket.emit("request-room-history", roomId);
        console.log(roomId);
        setCurrentRoom(roomId);
      } catch (error) {
        console.error("Error handling room join:", error);
        setError("Failed to join room");
      }
    });

    socket.on(EVENTS.ROOM_HISTORY, (messages: Message[], roomId: number) => {
      // console.log(`Received message history for room ${roomId}:`, messages);

      const formattedMessages = messages?.map((msg) =>
        formatMessage(msg, userRef.current?.id)
      );

      // Update messagesMap which will trigger currentMessages to update automatically
      setMessagesMap((prev) => ({
        ...prev,
        [roomId]: formattedMessages,
      }));

      // Set last message for this room
      if (formattedMessages.length > 0) {
        const lastMsg = formattedMessages[formattedMessages.length - 1];
        setLastMessages((prev) => ({
          ...prev,
          [roomId]: {
            message: lastMsg.content,
            time: lastMsg.timestamp
              ? new Date(lastMsg.timestamp).toLocaleTimeString()
              : new Date().toLocaleTimeString(),
          },
        }));
      }
    });

    socket.on(EVENTS.ROOM_LEFT, (roomId: number) => {
      console.log(`Left room ${roomId}`);
      // Clear current room if it matches the left room
      if (currentRoom === roomId) {
        setCurrentRoom(null);
        // Clear messages for this room
        setMessagesMap((prev) => ({
          ...prev,
          [roomId]: [],
        }));
        // Clear last message for this room
        setLastMessages((prev) => {
          const newLastMessages = { ...prev };
          delete newLastMessages[roomId];
          return newLastMessages;
        });
      }
    });

    socket.on(EVENTS.MESSAGE, (msg: Message) => {
      setMessagesMap((prev) => {
        const roomMessages = prev[msg.roomId] || [];
        return {
          ...prev,
          [msg.roomId]: [
            ...roomMessages,
            formatMessage(msg, userRef.current?.id),
          ],
        };
      });

      // Update last message for this room
      setLastMessages((prev) => ({
        ...prev,
        [msg.roomId]: {
          message: msg.content,
          time: msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString()
            : new Date().toLocaleTimeString(),
        },
      }));
    });

    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinRoom = (roomId: string) => {
    const socket = socketRef.current;
    const token = localStorage.getItem("token");
    if (!socket || !socket.connected) return;

    socket.emit("join-room", roomId, token);
  };

 

  // const leaveRoom = (roomId: number) => {
  //   const socket = socketRef.current;
  //   if (!socket || !socket.connected) return;
  //   socket.emit('leave-room', roomId);
  // };

  const sendMessage = async (content: string) => {
    const socket = socketRef.current;
    const storedUser = localStorage.getItem('user');
    if(!storedUser) return
    const sender = JSON.parse(storedUser) as User;
    console.log('current user', sender)

    const roomId = currentRoom;

    if (!socket || !socket.connected || !sender || !roomId) return;

    try {
      const createdAt = new Date().toISOString();
      const message = {
        content,
        sender:{ 
          id: sender.id,
          username: sender.username
        },
        roomId,
        createdAt,
      };
      console.log('current message', message)

      // console.log('message', message)
      await apiService.createMessage(message);
      socket.emit("message", message);

      setMessagesMap((prev) => {
        const roomMessages = prev[roomId] || [];
        return {
          ...prev,
          [roomId]: [...roomMessages, { ...message, isOwn: true }],
        };
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    }
  };

  const createGroup = async (groupName: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected || !userRef.current) return;

    const storedUser = localStorage.getItem("user");
    let user: User | null = null;

    try {
      if (storedUser) {
        user = JSON.parse(storedUser) as User;
        const group = await apiService.createGroup({
          name: groupName,
          creator: user,
        });
        joinRoom(group.id.toString());
    }
    } catch (err) {
      console.error("Error creating group:", err);
      setError("Failed to create group");
    }
  };

  const saveVoiceRecord = async (file: File, duration: number, mimeType:string, conversationId?: string) => {
    try {
      // === Validate inputs ===
      if (!file || !duration || !conversationId) {
        throw new Error("Missing required parameters");
      }
      console.log( "file" ,file, "duration", duration, "currentRoom", conversationId);

      // === Prepare FormData ===
      const formData = new FormData();
      formData.append("voiceFile", file);
      formData.append("duration", duration.toString() );
      formData.append("conversationId", conversationId);
      formData.append("mimeType", mimeType); 
  
      // === Upload via API ===
      const result = await apiService.uploadVoiceMessage(formData);
  
      // Optional: handle result (e.g., update UI, emit socket event)
      console.log("Voice message uploaded:", result);
  
      return result;
    } catch (error) {
      console.error("Failed to save voice record:", error);
      throw error;
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
      // leaveRoom,
      createGroup,
      error,
      initialized,
      currentMessages,
      lastMessages,
      saveVoiceRecord,
    }),
    [
      isIdentified,
      currentMessages,
      currentRoom,
      user,
      error,
      initialized,
      lastMessages,
    ]
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
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
