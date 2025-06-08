import { Message } from "@/services/api.service";

export const formatMessage = (msg: Message, currentUserId?: string): Message => ({
  ...msg,
  createdAt: msg.createdAt || new Date().toISOString(),
  isOwn: msg.sender.id === currentUserId,
});
