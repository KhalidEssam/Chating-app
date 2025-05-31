import { Socket } from 'socket.io-client';

export interface SocketContextType {
  socket: Socket;
  currentRoom: string;
  joinRoom: (roomId: string) => void;
}
