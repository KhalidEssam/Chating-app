import { Dispatch, SetStateAction } from "react";
import { EVENTS } from "../socketEvents";
import { Message } from "@/services/api.service";
import { formatMessage } from "../utils/formatMessage";
import { Socket } from "socket.io-client";

export function handleRoomJoined(
  roomId: number,
  socket: Socket,
  setCurrentRoom: Dispatch<SetStateAction<number | null>>
) {
  socket.emit(EVENTS.ROOM_JOINED, roomId);
  setCurrentRoom(roomId);
}

export function handleRoomLeft(
  roomId: number,
  socket: Socket,
  setCurrentRoom: Dispatch<SetStateAction<number | null>>
) {
  socket.emit(EVENTS.ROOM_LEFT, roomId);
  setCurrentRoom(null);
}

export function handleRoomHistory(
  messages: Message[],
  roomId: number,
  setMessagesMap: Dispatch<SetStateAction<Record<number, Message[]>>>,
  currentUserId?: string
) {
  const formattedMessages = messages?.map((msg) =>
    formatMessage(msg, currentUserId)
  );
  
  setMessagesMap(prev => ({
    ...prev,
    [roomId]: formattedMessages || []
  }));
}
