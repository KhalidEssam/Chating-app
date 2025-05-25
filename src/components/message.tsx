import { Box, Typography } from '@mui/material';
import { Message } from '@/types/chat';

interface MessageProps {
  message: Message;
  isOwn: boolean;
  name : string;
}

export const MessageItem = ({ message, isOwn , name }: MessageProps) => {
  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 2,
        backgroundColor: isOwn ? 'primary.main' : 'grey.100',
        color: isOwn ? 'white' : 'black',
      }}
    >
      <Typography variant="body2">{message.content}</Typography>
      <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'right' }}>
        {new Date(message.timestamp).toLocaleTimeString()}
      </Typography>
    </Box>
  );
};
