import { Typography, Box } from "@mui/material";

interface ChatHeaderProps {
  roomId: string;
  messageCount: number;
}

export const ChatHeader = ({ roomId, messageCount }: ChatHeaderProps) => {
  return (
    <Box px={2} py={1} borderBottom={1} borderColor="divider">
      <Typography variant="h6">
        Room: {roomId || "Not Joined"}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Messages: {messageCount}
      </Typography>
    </Box>
  );
};
