// handlers/handleClearMessages.ts
import { Dispatch, SetStateAction } from "react";
import { Message } from "@/services/api.service";

export function handleClearMessages(
  roomId: string,
  setMessagesMap: Dispatch<SetStateAction<Record<string, Message[]>>>,
  setLastMessages: Dispatch<SetStateAction<Record<string, { message: string; time: string }>>>
) {
  setMessagesMap(prev => {
    const newMap = { ...prev };
    delete newMap[roomId];
    return newMap;
  });

  setLastMessages(prev => {
    const newLastMessages = { ...prev };
    delete newLastMessages[roomId];
    return newLastMessages;
  });
}