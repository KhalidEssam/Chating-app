'use client';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { useSocket } from '@/contexts/socket-context';
import { useRouter } from 'next/navigation'; // ✅ Correct for Next.js

export const GroupCreateModal = () => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const { createGroup } = useSocket();
  const router = useRouter();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setGroupName('');
  };

  const handleCreateGroup = async () => {
    try {
      await createGroup(groupName);
      handleClose();
      router.push(`/groups/${groupName}`);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <>
      <Button variant="outlined" onClick={handleOpen}>
        Create Group
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Group Name"
              type="text"
              fullWidth
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateGroup} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
