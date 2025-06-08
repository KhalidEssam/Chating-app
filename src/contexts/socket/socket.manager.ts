// socket.manager.ts
import { io, Socket } from "socket.io-client";

export const createSocket = (): Socket => {
  return io("http://localhost:3001", {
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 10000,
    autoConnect: false,
  });
};
