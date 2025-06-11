// socket.handlers.ts
import { EVENTS } from "@/contexts/socket/socketEvents";
import apiService, { Message, User } from "@/services/api.service";
import { SocketActions } from "@/contexts/socket/handlers/socket.actions";
import {formatMessage} from '@/contexts/socket/utils/formatMessage'
import { io, type Socket } from "socket.io-client";

export const registerSocketHandlers = (
  socketActions: SocketActions,
  socket: Socket
) => {
  // Clear any existing handlers first to avoid duplicates
  socket.off(); 

  socket.on(EVENTS.CONNECT, async () => {
    console.log("Socket connected:", socket.id);
    const token = localStorage.getItem("token");
    if (!token) {
      socketActions.setError("No token found");
      socketActions.setInitialized(true);
      return;
    }

    try {
      await apiService.getUsers();
      socketActions.setError(null);
      socketActions.setIsIdentified(true);
      socketActions.setInitialized(true);
      socket.emit("identify", {
        name: socketActions.userRef.current?.username,
        phoneNumber: socketActions.userRef.current?.phoneNumber,
      });
    } catch (err) {
      console.error("Authentication failed:", err);
      socketActions.setError("Authentication failed");
      socketActions.setIsIdentified(false);
      socketActions.setInitialized(true);
    }
  });

  socket.on(EVENTS.DISCONNECT, (reason) => {
    console.log("Socket disconnected:", reason);
    socketActions.setIsIdentified(false);
    socketActions.setUser(null);
    socketActions.setCurrentRoom(null);
  });

  socket.on(EVENTS.CONNECT_ERROR, (err) => {
    console.error("Socket connection error:", err);
    socketActions.setError("Socket connection error");
    socketActions.setInitialized(true);
  });

  socket.on(EVENTS.IDENTIFICATION_CONFIRMED, (userData: User) => {
    console.log("Identification confirmed:", userData);
    socketActions.setUser(userData);
    socketActions.setIsIdentified(true);
  });

  socket.on(EVENTS.ROOM_JOINED, (roomId: number) => {
    console.log("Room joined:", roomId);
    socketActions.setCurrentRoom(roomId);
    socket.emit("request-room-history", roomId);
  });

  socket.on(EVENTS.ROOM_HISTORY, (messages: Message[], roomId: number) => {
    // Replace all messages for this room
    socketActions.setMessagesMap(prev => ({
      ...prev,
      [roomId]: messages.map(msg => 
        formatMessage(msg, socketActions.userRef.current?.id)
      )
    }));

    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      socketActions.setLastMessages(prev => ({
        ...prev,
        [roomId]: {
          message: lastMsg.content,
          time: lastMsg.createdAt
            ? new Date(lastMsg.createdAt).toLocaleTimeString()
            : new Date().toLocaleTimeString(),
        },
      }));
    }
  });

  socket.on(EVENTS.MESSAGE, (msg: Message) => {
    socketActions.handleNewMessage(msg);
  });
};