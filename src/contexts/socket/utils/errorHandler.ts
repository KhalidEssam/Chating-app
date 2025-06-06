import { Socket } from "socket.io-client";
import { EVENTS } from "../socketEvents";

export const handleSocketError = (socket: Socket, setError: (error: string | null) => void) => {
  socket.on(EVENTS.CONNECT_ERROR, (err) => {
    console.error("Socket connection error:", err);
    setError("Socket connection error");
  });

  socket.on(EVENTS.DISCONNECT, (reason) => {
    console.log("Socket disconnected:", reason);
    setError("Socket disconnected");
  });
};

export const clearSocketError = (setError: (error: string | null) => void) => {
  setError(null);
};

export const isConnectionError = (error: string | null): boolean => {
  if (!error) return false;
  return error.includes("connection") || error.includes("disconnected");
};
