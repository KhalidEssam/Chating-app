import { Box, Typography } from "@mui/material";
import { Message } from "@/services/api.service";
import { User } from "@/services/api.service";
import { RefObject } from "react";
import { MessageItem } from "../message";

interface ChatMessagesProps {
  messages: Message[];
  user: User | null;
  highlightedMessageId: string | null;
  messageRefs: RefObject<{ [key: string]: HTMLDivElement | null }>;
}

export const ChatMessages = ({
  messages,
  user,
  highlightedMessageId,
  messageRefs,
}: ChatMessagesProps) => {
  return (
    <>
      {messages.map((msg) => {
        const isOwn = msg.sender?.id === user?.id;
        const isHighlighted = msg.id === highlightedMessageId;

        return (
          <Box
            key={msg.id}
            ref={(el: HTMLDivElement | null) => {
              if (msg.id && messageRefs.current)
                messageRefs.current[msg.id] = el;
            }}
            sx={{
              display: "flex",
              justifyContent: isOwn ? "flex-end" : "flex-start",
              border: isHighlighted ? "2px solid red" : "none",
            }}
          >
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                display: isOwn ? "none" : "block",
                padding: "10px",
              }}
            >
              {msg.sender?.username}
            </Typography>
            <MessageItem message={msg} isOwn={isOwn} />
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                display: isOwn ? "block" : "none",
                padding: "10px",
              }}
            >
              {msg.sender?.username}
            </Typography>
          </Box>
        );
      })}
    </>
  );
};
