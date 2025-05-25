// contexts/socket-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { Message } from '@/types/chat';

interface SocketContextType {
  socketRef: React.RefObject<Socket | null>;
  isIdentified: boolean;
  messages: Message[];
  user: {
    id: string;
    name: string;
    phoneNumber: string;
  };
  sendMessage: (content: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isIdentified, setIsIdentified] = useState(false);
  const [user, setUser] = useState({
    id: '',
    name: '',
    phoneNumber: ''
  });
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
      // Add this to prevent multiple connections
      forceNew: false,
      autoConnect: false
    });

    socketRef.current = socket;

    // Connect manually after setting up listeners
    socket.connect();

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
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
        phoneNumber: userData.phoneNumber || ''
      });
      setIsIdentified(true);
    });

    socket.on('message', (msg: Message) => {
      console.log('Received message:', msg);
      const isFromThisClient = msg.sender.id === socketRef.current?.id;
      setMessages((prev) => [...prev, { ...msg, isOwn: isFromThisClient }]);
    });

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Add sendMessage function
  const sendMessage = (content: string) => {
    if (!isIdentified) return;
    console.log('User is identified, sending message');
    
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    console.log('Socket is connected:', socket.connected);

    
    socket.emit('message', {
      content,
      timestamp: new Date().toISOString(),
      sender: user
    });
  };

  return (
    <SocketContext.Provider value={{ 
      socketRef, 
      isIdentified, 
      messages, 
      user,
      sendMessage 
    }}>
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