'use client';

import { useState, useEffect } from 'react';
import { Box, Paper, TextField, IconButton } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useSocket } from '@/contexts/socket-context';
import { MessageItem } from './message';
import { Typography } from '@mui/material';

interface ChatRoomProps {}

export const ChatRoom = ({}: ChatRoomProps) => {
  const [message, setMessage] = useState('');
  const { sendMessage, messages, currentRoom, joinRoom } = useSocket();

  useEffect(() => {
    // Join the general room when component mounts
    if (!currentRoom) {
      joinRoom('general');
    }
  }, [currentRoom, joinRoom]);

  useEffect(() => {
    console.log('Messages state:', messages);
  }, [messages]);

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

  useEffect(() => {
    console.log('Messages state:', messages);
  }, [messages]);

  return (
    <Box flex={1} p={6}>
      <Paper sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        <Box p={2}>
          <Typography variant="h6" fontWeight="bold">
            {currentRoom ? currentRoom : 'No room selected'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Messages count: {messages.length}
          </Typography>
        </Box>
        <Box flex={1} overflow="auto" p={2}>
          {messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              gap={1}
              justifyContent={msg.isOwn ? 'flex-end' : 'flex-start'}
            >
              {!msg.isOwn && (
                <Typography variant="body2" color="textSecondary">
                  {msg.sender.name}
                </Typography>
              )}
              <MessageItem
                message={msg}
                isOwn={msg.isOwn}
              />
              {msg.isOwn && (
                <Typography variant="body2" color="textSecondary">
                  {msg.sender.name}
                </Typography>
              )}
            </Box>
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