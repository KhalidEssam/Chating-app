'use client';

import { useState } from 'react';
import { Box, Paper, TextField, Button } from '@mui/material';
import { useSocket } from '@/contexts/socket-context';
export const UserIdentification = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { socketRef, isIdentified } = useSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      if (socketRef.current) {
        socketRef.current.emit('identify', {
          name,
          phoneNumber: phoneNumber || undefined
        });
      }
    } catch (error) {
      console.error('Error sending user identification:', error);
    }
  };

  if (isIdentified) {
    return null; // Show ChatRoom instead
  }

  return (
    <Box flex={1} p={2} display="flex" justifyContent="center" alignItems="center">
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Phone Number (optional)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            margin="normal"
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={!name}
          >
            Continue to Chat
          </Button>
        </form>
      </Paper>
    </Box>
  );
};
