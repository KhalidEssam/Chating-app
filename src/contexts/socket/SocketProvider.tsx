"use client";
import {
  SocketContext,
  SocketContextType,
} from "@/contexts/socket/SocketContext";
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import apiService from "@/services/api.service";
import { Message, User } from "@/services/api.service";
import { io, type Socket } from "socket.io-client";

import { EVENTS } from "@/contexts/socket/socketEvents";
import { handleMessage } from "@/contexts/socket/handlers/handleMessage";
import { handleClearMessages } from "@/contexts/socket/handlers/handleClearMessages";

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const authUser = useAuth();

  const [isIdentified, setIsIdentified] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<number | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<number, Message[]>>({});
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

  // Memoized message handler
  const handleNewMessage = useCallback((msg: Message) => {
    handleMessage(msg, setMessagesMap, setLastMessages, userRef.current?.id);
  }, []);

  const handleClearRoomMessages = useCallback((roomId: number) => {
    handleClearMessages(roomId.toString(), setMessagesMap, setLastMessages);
  }, []);

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
      if (currentRoom === roomId) {
        return;
      }
      try {
        // Request room history after joining
        // console.log("socket",socket);
        socket.emit("request-room-history", roomId);

        console.log("currentRoom", currentRoom, "roomId", roomId);
        setCurrentRoom(roomId);
      } catch (error) {
        console.error("Error handling room join:", error);
        setError("Failed to join room");
      }
    });

    socket.on(EVENTS.ROOM_HISTORY, (messages: Message[], roomId: number) => {
      messages.forEach((msg) => {
        handleNewMessage({
          ...msg,
          roomId: roomId, // Ensure roomId is number to match type
        });
      });
    });

    socket.on(EVENTS.MESSAGE, (msg: Message) => {
      handleNewMessage(msg);
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
    if (!socket || !socket.connected || roomId === currentRoom?.toString())
      return;
    socket.emit("join-room", roomId, token);
  };

  const sendMessage = async (content: string) => {
    const socket = socketRef.current;
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const sender = JSON.parse(storedUser) as User;
    // console.log("current user", sender);

    const roomId = currentRoom;

    if (!socket || !socket.connected || !sender || !roomId) return;

    try {
      const createdAt = new Date().toISOString();
      const message = {
        content,
        sender: {
          id: sender.id,
          username: sender.username,
        },
        roomId,
        createdAt,
      };
      await apiService.createMessage(message);
      socket.emit("message", message);

      handleNewMessage(message);

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

  const saveVoiceRecord = async (
    file: File,
    duration: number,
    mimeType: string,
    conversationId?: string
  ) => {
    try {
      // === Validate inputs ===
      if (!file || !duration || !conversationId) {
        throw new Error("Missing required parameters");
      }
      console.log(
        "file",
        file,
        "duration",
        duration,
        "currentRoom",
        conversationId
      );

      // === Prepare FormData ===
      const formData = new FormData();
      formData.append("voiceFile", file);
      formData.append("duration", duration.toString());
      formData.append(
        "conversationId",
        currentRoom ? currentRoom.toString() : conversationId
      );
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
