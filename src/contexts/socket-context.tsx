// 'use client';

// import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
// import { io, type Socket } from 'socket.io-client';
// import { Message, User, apiService } from '@/services/api.service';

// interface SocketContextType {
//   socketRef: React.RefObject<Socket | null>;
//   isIdentified: boolean;
//   messages: Message[]; // current room messages only
//   currentRoom: string | null;
//   user: {
//     id: string;
//     name: string;
//     phoneNumber: string;
//   };
//   sendMessage: (content: string) => void;
//   joinRoom: (roomId: string) => void;
//   leaveRoom: () => void;
//   error: string | null;
//   initialized: boolean;
// }

// const SocketContext = createContext<SocketContextType | null>(null);

// export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
//   const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
//   const [isIdentified, setIsIdentified] = useState(false);
//   const [user, setUser] = useState<User>({
//     id: '',
//     name: '',
//     phoneNumber: '',
//   });
//   const [currentRoom, setCurrentRoom] = useState<string | null>('general');
//   const socketRef = useRef<Socket | null>(null);
//   const [users, setUsers] = useState<User[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [initialized, setInitialized] = useState(false);

//   useEffect(() => {
//     if (socketRef.current) {
//       console.log('Socket already exists, disconnecting old connection');
//       socketRef.current.disconnect();
//     }

//     const socket = io('http://localhost:3001', {
//       // reconnection: true,
//       reconnectionAttempts: 10,
//       reconnectionDelay: 1000,
//       timeout: 10000,
//       forceNew: false,
//       autoConnect: false,
//     });

//     socketRef.current = socket;
//     socket.connect();

//     socket.on('connect', async () => {
//       console.log('Socket connected:', socket.id);
      
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           throw new Error('No token found');
//         }

//         const fetchedUsers = await apiService.getUsers();
//         setUsers(fetchedUsers);
//         socket.emit('join-room', 'general');
//         setIsIdentified(true);
//         setInitialized(true);
//       } catch (error) {
//         console.error('Error:', error);
//         setError(error instanceof Error ? error.message : 'An error occurred');
//         setInitialized(true);
//       }
//     });

//     socket.on('room-joined', (roomId: string) => {
//       console.log('Room joined:', roomId);
//       setCurrentRoom(roomId);
//     });

//     socket.on('room-left', () => {
//       console.log('Room left');
//       setCurrentRoom(null);
//     });

//     socket.on('disconnect', (reason) => {
//       console.log('Socket disconnected:', reason);
//       setUser({ id: '', name: '', phoneNumber: '' });
//       setIsIdentified(false);
//     });

//     socket.on('connect_error', (err) => {
//       console.error('Socket connection error:', err);
//     });

//     socket.on('identification-confirmed', (userData) => {
//       console.log('Identification confirmed:', userData);
//       const socketId = socketRef.current?.id || '';
//       setUser({
//         id: socketId,
//         name: userData.name,
//         phoneNumber: userData.phoneNumber || '',
//       });
//       setIsIdentified(true);
//     });

//     // Fetch initial messages when joining a room
//     socket.on('room-joined', async (roomId: string) => {
//       console.log('Room joined:', roomId);
//       setCurrentRoom(roomId);
      
//       try {
//         const messages = await apiService.getMessages(roomId);
//         setMessagesMap((prev) => ({
//           ...prev,
//           [roomId]: messages,
//         }));
//       } catch (error) {
//         console.error('Error fetching messages:', error);
//       }
//     });

//     socket.on('message', async (msg: any) => {
//       console.log('Received message:', msg);
//       const isFromThisClient = msg.sender?.id === socketRef.current?.id;

//       // Save message to backend
//       try {
//         await apiService.createMessage({
//           content: msg.content,
//           senderId: msg.senderId,
//           roomId: msg.roomId,
//         });
//       } catch (error) {
//         console.error('Error saving message:', error);
//         setError('Failed to save message to backend');
//       }

//       setMessagesMap((prev) => {
//         const roomMessages = prev[msg.roomId] || [];
//         return {
//           ...prev,
//           [msg.roomId]: [...roomMessages, { ...msg, isOwn: isFromThisClient }],
//         };
//       });
//     });

//     // // Fetch users when connected
//     // socket.on('connect', async () => {
//     //   console.log('Socket connected:', socket.id);
      
//     //   try {
//     //     const token = localStorage.getItem('token');
//     //     if (!token) {
//     //       throw new Error('No token found');
//     //     }

//     //     const fetchedUsers = await apiService.getUsers();
//     //     setUsers(fetchedUsers);
//     //     socket.emit('join-room', 'general');
//     //   } catch (error) {
//     //     console.error('Error:', error);
//     //     setError(error instanceof Error ? error.message : 'An error occurred');
//     //     window.location.href = '/login';
//     //   }
//     // });

//     return () => {
//       if (socketRef.current) {
//         console.log('Cleaning up socket connection');
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, []);

//   const joinRoom = (roomId: string) => {
//     const socket = socketRef.current;
//     if (!socket || !socket.connected) return;
//     socket.emit('join-room', roomId);
//   };

//   const leaveRoom = () => {
//     const socket = socketRef.current;
//     if (!socket || !socket.connected) return;
//     socket.emit('leave-room');
//   };

//   const sendMessage = async (content: string) => {
//     if (!socketRef.current) return;
    
//     try {
//       // Save message to backend first
//       const message = await apiService.createMessage({
//         content,
//         senderId: user.id,
//         roomId: currentRoom || 'general',
//       });

//       // Then emit to socket
//       socketRef.current.emit('message', {
//         content: message.content,
//         sender: user,
//         roomId: currentRoom || 'general',
//         senderId: user.id
//       });
//     } catch (error) {
//       console.error('Error sending message:', error);
//       setError('Failed to send message');
//     }
//   };

//   const currentMessages = currentRoom ? messagesMap[currentRoom] || [] : [];

//   return (
//     <SocketContext.Provider
//       value={{
//         socketRef,
//         isIdentified,
//         messages: currentMessages,
//         currentRoom,
//         user,
//         sendMessage,
//         joinRoom,
//         leaveRoom,
//         error,
//         initialized,
//       }}
//     >
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => {
//   const context = useContext(SocketContext);
//   if (!context) {
//     throw new Error('useSocket must be used within a SocketProvider');
//   }
//   return context;
// };



'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { Message, User, apiService } from '@/services/api.service';

interface SocketContextType {
  socketRef: React.RefObject<Socket | null>;
  isIdentified: boolean;
  messages: Message[];
  currentRoom: string | null;
  user: User | null;
  sendMessage: (content: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  error: string | null;
  initialized: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [isIdentified, setIsIdentified] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<string | null>('general');
  const socketRef = useRef<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Clean up existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io('http://localhost:3001', {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: false,
    });

    socketRef.current = socket;

    // Single connect handler
    socket.on('connect', async () => {
      console.log('Socket connected:', socket.id);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found');
        setInitialized(true);
        return;
      }

      try {
        const fetchedUsers = await apiService.getUsers();
        setError(null);
        // You may want to store users somewhere if needed
        socket.emit('join-room', 'general');
        setIsIdentified(true);
        setInitialized(true);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Authentication failed');
        setIsIdentified(false);
        setInitialized(true);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setUser(null);
      setIsIdentified(false);
      setCurrentRoom(null);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Socket connection error');
      setInitialized(true);
    });

    socket.on('identification-confirmed', (userData: User) => {
      console.log('Identification confirmed:', userData);
      setUser(userData);
      setIsIdentified(true);
    });

    socket.on('room-joined', async (roomId: string) => {
      console.log('Room joined:', roomId);
      setCurrentRoom(roomId);

      try {
        const messages = await apiService.getMessages(roomId);
        setMessagesMap((prev) => ({
          ...prev,
          [roomId]: messages,
        }));
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    });

    socket.on('room-left', () => {
      console.log('Room left');
      setCurrentRoom(null);
    });

    socket.on('message', async (msg: Message) => {
      console.log('Received message:', msg);
      const isFromThisClient = user?.id === msg.senderId;

      setMessagesMap((prev) => {
        const roomMessages = prev[msg.roomId] || [];
        return {
          ...prev,
          [msg.roomId]: [...roomMessages, { ...msg, isOwn: isFromThisClient }],
        };
      });

      try {
        // Save message to backend (optional: you might want to do this only on sendMessage)
        await apiService.createMessage({
          content: msg.content,
          senderId: msg.senderId,
          roomId: msg.roomId,
        });
      } catch (error) {
        console.error('Error saving message:', error);
        setError('Failed to save message to backend');
      }
    });

    socket.connect();

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

  const sendMessage = async (content: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected || !user || !currentRoom) return;

    try {
      // Create message on backend first
      const message = await apiService.createMessage({
        content,
        senderId: user.id,
        roomId: currentRoom,
      });

      // Emit message to server
      socket.emit('message', {
        content: message.content,
        sender: user,
        roomId: currentRoom,
        senderId: user.id,
      });

      // Optimistically update messages locally (optional)
      setMessagesMap((prev) => {
        const roomMessages = prev[currentRoom] || [];
        return {
          ...prev,
          [currentRoom]: [...roomMessages, { ...message, isOwn: true }],
        };
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
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
        error,
        initialized,
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
