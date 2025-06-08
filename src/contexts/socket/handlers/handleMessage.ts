// handlers/handleMessage.ts
import { Message } from "@/services/api.service";
import { Dispatch, SetStateAction } from "react";
import { formatMessage } from "../utils/formatMessage";

export function handleMessage(
  msg: Message,
  setMessagesMap: Dispatch<SetStateAction<Record<number, Message[]>>>,
  setLastMessages: Dispatch<SetStateAction<Record<number, { message: string; time: string }>>>,
  currentUserId?: string
) {
  setMessagesMap(prev => {
    const roomMessages = prev[msg.roomId] || [];
    
    // Check if message already exists
    const messageExists = roomMessages.some(m => m.id === msg.id);
    if (messageExists) {
      return prev;
    }

    return {
      ...prev,
      [msg.roomId]: [...roomMessages, formatMessage(msg, currentUserId)],
    };
  });

  setLastMessages(prev => ({
    ...prev,
    [msg.roomId]: {
      message: msg.content,
      time: msg.createdAt
        ? new Date(msg.createdAt).toLocaleTimeString()
        : new Date().toLocaleTimeString(),
    },
  }));
}
