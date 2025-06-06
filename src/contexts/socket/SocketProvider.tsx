// "use client";

// import React, { useEffect, useState, useRef, useMemo } from "react";
// import { io, Socket } from "socket.io-client";
// import SocketContext, { SocketContextType } from "./SocketContext";
// import { EVENTS } from "./socketEvents";
// import { formatMessage } from "./utils/formatMessage";
// import { handleSocketError, clearSocketError } from "./utils/errorHandler";
// import { handleRoomJoined, handleRoomLeft, handleRoomHistory } from "./handlers/handleRoomEvents";
// import { handleMessage } from "./handlers/handleMessage";
// import { useAuth } from "@/hooks/useAuth";
// import apiService, { Message, User } from "@/services/api.service";

// export function SocketProvider({ children }: { children: React.ReactNode }) {
//   const authUser = useAuth();

//   const [messagesMap, setMessagesMap] = useState<Record<number, Message[]>>({});
//   const [isIdentified, setIsIdentified] = useState(false);
//   const [user, setUser] = useState<User | null>(null);
//   const [currentRoom, setCurrentRoom] = useState<number | null>(null);
//   const [lastMessages, setLastMessages] = useState<
//     Record<number, { message: string; time: string }>
//   >({});
//   const socketRef = useRef<Socket | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [initialized, setInitialized] = useState(false);

//   const userRef = useRef<User | null>(null);
//   useEffect(() => {
//     userRef.current = user;
//   }, [user]);

//   useEffect(() => {
//     const socket = io("http://localhost:3001", {
//       reconnectionAttempts: 10,
//       reconnectionDelay: 1000,
//       timeout: 10000,
//       autoConnect: false,
//     });

//     socketRef.current = socket;

//     socket.on(EVENTS.CONNECT, async () => {
//       console.log("Socket connected:", socket.id);
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("No token found");
//         setInitialized(true);
//         return;
//       }

//       try {
//         await apiService.getUsers(); // validate user token
//         setError(null);
//         setIsIdentified(true);
//         setInitialized(true);
//         socket.emit("identify", {
//           name: authUser?.name,
//           phoneNumber: authUser?.phoneNumber,
//         });
//       } catch (err) {
//         console.error("Authentication failed:", err);
//         setError("Authentication failed");
//         setIsIdentified(false);
//         setInitialized(true);
//       }
//     });

//     socket.on(EVENTS.DISCONNECT, (reason) => {
//       console.log("Socket disconnected:", reason);
//       setIsIdentified(false);
//       setUser(null);
//       setCurrentRoom(null);
//     });

//     socket.on(EVENTS.CONNECT_ERROR, (err) => {
//       console.error("Socket connection error:", err);
//       setError("Socket connection error");
//       setInitialized(true);
//     });

//     socket.on(EVENTS.IDENTIFICATION_CONFIRMED, (userData: User) => {
//       console.log("Identification confirmed:", userData);
//       setUser(userData);
//       setIsIdentified(true);
//     });

//     socket.on(EVENTS.ROOM_JOINED, async (roomId: number) => {
//       console.log("Room joined:", roomId);
//       try {
//         socket.emit("request-room-history", roomId);
//         setCurrentRoom(roomId);
//       } catch (error) {
//         console.error("Error handling room join:", error);
//         setError("Failed to join room");
//       }
//     });

//     socket.on(EVENTS.ROOM_HISTORY, (messages: Message[], roomId: number) => {
//       console.log(`Received message history for room ${roomId}:`, messages);

//       const formattedMessages = messages?.map((msg) =>
//         formatMessage(msg, userRef.current?.id)
//       );

//       setMessagesMap((prev) => ({
//         ...prev,
//         [roomId]: formattedMessages,
//       }));

//       if (formattedMessages.length > 0) {
//         const lastMsg = formattedMessages[formattedMessages.length - 1];
//         setLastMessages((prev) => ({
//           ...prev,
//           [roomId]: {
//             message: lastMsg.content,
//             time: lastMsg.timestamp
//               ? new Date(lastMsg.timestamp).toLocaleTimeString()
//               : new Date().toLocaleTimeString(),
//           },
//         }));
//       }
//     });

//     socket.on(EVENTS.ROOM_LEFT, (roomId: number) => {
//       console.log(`Left room ${roomId}`);
//       if (currentRoom === roomId) {
//         setCurrentRoom(null);
//         setMessagesMap((prev) => ({
//           ...prev,
//           [roomId]: [],
//         }));
//         setLastMessages((prev) => {
//           const newLastMessages = { ...prev };
//           delete newLastMessages[roomId];
//           return newLastMessages;
//         });
//       }
//     });

//     socket.on(EVENTS.MESSAGE, (msg: Message) => {
//       setMessagesMap((prev) => {
//         const roomMessages = prev[msg.roomId] || [];
//         return {
//           ...prev,
//           [msg.roomId]: [...roomMessages, formatMessage(msg, userRef.current?.id)],
//         };
//       });

//       setLastMessages((prev) => ({
//         ...prev,
//         [msg.roomId]: {
//           message: msg.content,
//           time: msg.timestamp
//             ? new Date(msg.timestamp).toLocaleTimeString()
//             : new Date().toLocaleTimeString(),
//         },
//       }));
//     });

//     socket.connect();

//     return () => {
//       socket.disconnect();
//       socketRef.current = null;
//     };
//   }, [authUser]);

//   const joinRoom = (roomId: string) => {
//     const socket = socketRef.current;
//     const token = localStorage.getItem("token");
//     if (!socket || !socket.connected) return;

//     socket.emit("join-room", roomId, token);
//   };

//   const sendMessage = async (content: string) => {
//     const socket = socketRef.current;
//     const storedUser = localStorage.getItem("user");
//     if (!storedUser) return;
//     const sender = JSON.parse(storedUser) as User;

//     const roomId = currentRoom;

//     if (!socket || !socket.connected || !sender || !roomId) return;

//     try {
//       const createdAt = new Date().toISOString();
//       const message = {
//         content,
//         sender: {
//           id: sender.id,
//           username: sender.username,
//         },
//         roomId,
//         createdAt,
//       };

//       await apiService.createMessage(message);
//       socket.emit("message", message);

//       setMessagesMap((prev) => {
//         const roomMessages = prev[roomId] || [];
//         return {
//           ...prev,
//           [roomId]: [...roomMessages, { ...message, isOwn: true }],
//         };
//       });
//     } catch (err) {
//       console.error("Error sending message:", err);
//       setError("Failed to send message");
//     }
//   };

//   const createGroup = async (groupName: string) => {
//     const socket = socketRef.current;
//     if (!socket || !socket.connected || !userRef.current) return;

//     const storedUser = localStorage.getItem("user");
//     let user: User | null = null;

//     try {
//       if (storedUser) {
//         user = JSON.parse(storedUser) as User;
//         const group = await apiService.createGroup({
//           name: groupName,
//           creator: user,
//         });
//         joinRoom(group.id.toString());
//       }
//     } catch (err) {
//       console.error("Error creating group:", err);
//       setError("Failed to create group");
//     }
//   };

//   const currentMessages = currentRoom ? messagesMap[currentRoom] || [] : [];

//   const contextValue = useMemo<SocketContextType>(
//     () => ({
//       socketRef,
//       isIdentified,
//       messages: currentMessages,
//       currentRoomId: currentRoom,
//       user,
//       sendMessage,
//       joinRoom,
//       createGroup,
//       error,
//       initialized,
//       currentMessages,
//       lastMessages,
//     }),
//     [
//       isIdentified,
//       currentMessages,
//       currentRoom,
//       user,
//       error,
//       initialized,
//       lastMessages,
//     ]
//   );

//   return (
//     <SocketContext.Provider value={contextValue}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export default SocketProvider;
