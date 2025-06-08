import { User, Message } from "@/services/api.service";
import { Socket } from "socket.io-client";
import { EVENTS } from "./socketEvents";

export interface SocketContextType {
  socketRef: React.RefObject<Socket | null>;
  isIdentified: boolean;
  messagesMap: Record<number, Message[]>;
  currentRoom: number | null;
  user: User | null;
  sendMessage: (content: string) => void;
  joinRoom: (roomId: number) => void;
  createGroup: (groupName: string) => Promise<void>;
  error: string | null;
  initialized: boolean;
  lastMessages: Record<number, { message: string; time: string }>;
}

export interface SocketState {
  messagesMap: Record<number, Message[]>;
  isIdentified: boolean;
  user: User | null;
  currentRoom: number | null;
  lastMessages: Record<number, { message: string; time: string }>;
  error: string | null;
  initialized: boolean;
}

export interface SocketActions {
  sendMessage: (content: string) => void;
  joinRoom: (roomId: number) => void;
  createGroup: (groupName: string) => Promise<void>;
}

export interface SocketError {
  code: string;
  message: string;
  timestamp: string;
}

// export type SocketEvent = keyof typeof EVENTS;

// export type SocketAction = {
//   type: SocketEvent;
//   payload?: any;
// };

// export type SocketReducer = (state: SocketState, action: SocketAction) => SocketState;

//   timestamp: string;
// }

// export type SocketEvent = keyof typeof EVENTS;

// export type SocketAction = {
//   type: SocketEvent;
//   payload?: any;
// };

// export type SocketReducer = (state: SocketState, action: SocketAction) => SocketState;

//   timestamp: string;
// }

// export type SocketEvent = keyof typeof EVENTS;

// export type SocketAction = {
//   type: SocketEvent;
//   payload?: any;
// };

// export type SocketReducer = (state: SocketState, action: SocketAction) => SocketState;
