import { Box, Typography, Button } from "@mui/material";
import { Message } from "@/services/api.service";

interface ChatSearchResultsProps {
  messages: Message[];
  scrollToMessage: (messageId: string) => void;
}

export const ChatSearchResults = ({
  messages,
  scrollToMessage,
}: ChatSearchResultsProps) => {
  if (messages.length === 0) return null;

  return (
    <Box mb={2} p={1} border="1px solid #ccc" borderRadius={2}>
      <Typography variant="subtitle1">Search Results</Typography>
      {messages.map((msg) => (
        <Box key={msg.id} display="flex" justifyContent="space-between" alignItems="center" my={1}>
          <Typography variant="body2" noWrap maxWidth="70%">
            {msg.content}
          </Typography>
          <Button size="small" onClick={() => scrollToMessage(msg.id || '')}>
            Go
          </Button>
        </Box>
      ))}
    </Box>
  );
};
