// import { createContext } from "react";
// import { Socket } from "socket.io-client";
// import { Message, User } from "@/services/api.service";

// export interface SocketContextType {
//   socketRef: React.RefObject<Socket | null>;
//   isIdentified: boolean;
//   messages: Message[];
//   currentRoomId: number | null;
//   currentMessages: Message[];
//   user: User | null;
//   sendMessage: (content: string) => void;
//   joinRoom: (roomId: string) => void;
//   createGroup: (groupName: string) => Promise<void>;
//   error: string | null;
//   initialized: boolean;
//   lastMessages: Record<number, { message: string; time: string }>;
// }

// export const SocketContext = createContext<SocketContextType | null>(null);

// export default SocketContext;
