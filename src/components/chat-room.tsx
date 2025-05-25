'use client';

import { useState, useEffect } from 'react';
import { Box, Paper, TextField, IconButton } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useSocket } from '@/hooks/use-socket';
import { Message } from '@/types/chat';
import { MessageItem } from './message';

interface ChatRoomProps {}

export const ChatRoom = ({}: ChatRoomProps) => {
  const [message, setMessage] = useState('');
  const { sendMessage, messages } = useSocket();

  useEffect(() => {
    // This effect ensures the socket stays connected
    return () => {
      // Don't disconnect here - let the socket hook handle cleanup
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  return (
    <Box flex={1} p={2}>
      <Paper sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        <Box flex={1} overflow="auto" p={2}>
          {messages.map((msg, index) => (
            <MessageItem
              key={index}
              message={msg}
              isOwn={msg.isOwn}
            />
          ))}
        </Box>
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                variant="outlined"
              />
              <IconButton type="submit" color="primary">
                <Send />
              </IconButton>
            </Box>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};
