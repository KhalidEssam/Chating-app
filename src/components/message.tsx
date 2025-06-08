import { Box, Typography } from "@mui/material";
import { Message } from "@/services/api.service";

import VoiceRecorderPlayer from "./voiceRecorderPlayer";

interface MessageProps {
  message: Message;
  isOwn: boolean;
}

export const MessageItem = ({ message, isOwn }: MessageProps) => {
  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 2,
        backgroundColor: isOwn ? "primary.main" : "grey.100",
        color: isOwn ? "white" : "black",
      }}
    >
      {message.content ? (
        <>
          <Typography variant="body2"> {message.content}</Typography>
          <Typography variant="caption" sx={{ mt: 0.5, textAlign: "right" }}>
            {message.createdAt}
          </Typography>
        </>
      ) : (
        <VoiceRecorderPlayer
          audioUrl={message.filePath}
          initduration={message.duration ? message.duration : 11}
          timestamp={
            message.createdAt ? message.createdAt : new Date().toString()
          }
          waveformColor="#25D366" // WhatsApp green
          backgroundColor="#e5e5ea" // Light gray
          playheadColor="#34B7F1" // WhatsApp blue
        />
      )}
    </Box>
  );
};
