import { Message } from "@/services/api.service";

export const formatMessage = (msg: Message, currentUserId?: string): Message => ({
  ...msg,
  timestamp: msg.timestamp || new Date().toISOString(),
  isOwn: msg.sender.id === currentUserId,
});
