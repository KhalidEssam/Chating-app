import { Box, IconButton, InputBase, Paper } from "@mui/material";
import { Send } from "@mui/icons-material";
import { ReactNode } from "react";

interface MessageInputProps {
  message: string;
  setMessage: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  children?: ReactNode;
}

export const MessageInput = ({
  message,
  setMessage,
  onSubmit,
  children,
}: MessageInputProps) => {
  return (
    <Paper
      component="form"
      onSubmit={onSubmit}
      sx={{ display: "flex", alignItems: "center", p: 1 }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {children}
      <IconButton type="submit" color="primary">
        <Send />
      </IconButton>
    </Paper>
  );
};
