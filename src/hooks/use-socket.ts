
// import { useEffect, useState, useRef } from 'react';
// import { io, type Socket } from 'socket.io-client';
// import { Message } from '@/types/chat';

// interface SocketMessage extends Omit<Message, 'isOwn'> {
//   isOwn: boolean;
//   senderId?: string;
// }

// export const useSocket = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const socketRef = useRef<Socket | null>(null);
//   const isInitialized = useRef(false);

//   useEffect(() => {
//     if (!isInitialized.current) {
//       console.log('Initializing socket connection');
//       isInitialized.current = true;
      
//       const socket = io('http://localhost:3001', {
//         reconnection: true,
//         reconnectionAttempts: 10,
//         reconnectionDelay: 1000,
//         timeout: 10000,
//       });
//       socketRef.current = socket;

//       socket.on('connect', () => {
//         console.log('Socket connected, socket ID:', socket.id);
//       });

//       socket.on('disconnect', (reason) => {
//         console.log('Socket disconnected:', reason);
//       });

//       socket.on('connect_error', (err) => {
//         console.error('Socket connection error:', err);
//       });

//       socket.on('message', (msg: SocketMessage) => {
//         console.log('Received message:', msg);
//         const isFromThisClient = msg.senderId === socket.id;
//         setMessages((prev) => [...prev, { ...msg, isOwn: isFromThisClient }]);
//       });

//       return () => {
//         if (socket) {
//           console.log('Disconnecting socket');
//           socket.disconnect();
//           socketRef.current = null;
//           isInitialized.current = false;
//         }
//       };
//     }
//   }, []);

//   const sendMessage = (content: string) => {
//     const socket = socketRef.current;
//     if (!socket || !socket.connected) return;
    
//     const msg: SocketMessage = {
//       content,
//       timestamp: new Date().toISOString(),
//       isOwn: true,
//     };
//     console.log('Sending message:', msg);
//     socket.emit('message', msg);
//   };

//   return { messages, sendMessage };
// };
