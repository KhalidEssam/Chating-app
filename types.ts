import { Socket } from 'socket.io';
import { Message } from './src/types/chat';

export const ServerSocket = Socket;
export type ServerMessage = Message;
