'use client';

import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemText, Avatar, Typography, IconButton } from '@mui/material';
import { Person, GroupAdd, ExitToApp } from '@mui/icons-material';
import { useSocket } from "@/contexts/socket-context";
import { GroupCreateModal } from './group-create-modal';
import {apiService} from '@/services/api.service';  // adjust path accordingly

interface Room {
  id: number;
  name: string;
  participants: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export const ChatSidebar = () => {
  const { currentRoomId: currentRoom, joinRoom,  lastMessages } = useSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    async function fetchGroups() {
      try {
        const groups = await apiService.getAllGroups();
        // console.log(groups);
        // Assuming API returns array of groups like [{ id, name, members: [] }]
        const formattedRooms = groups.map((group: any) => ({
          id: group.id.toString(),
          name: group.name,
          participants: group.members ? group.members.length : 0,
        }));
        setRooms(formattedRooms);
      } catch (err) {
        setError('Failed to load groups');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []);

  if (loading) {
    return <Typography p={2}>Loading groups...</Typography>;
  }

  if (error) {
    return <Typography color="error" p={2}>{error}</Typography>;
  }

  return (
    <Box
      sx={{
        width: 280,
        borderRight: 10,
        paddingBlock: 6,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <GroupCreateModal />

      <Box p={2}>
        <Typography variant="h6" fontWeight="bold">
          Chat Rooms
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {currentRoom !== undefined && (
            <Typography variant="subtitle2" color="textSecondary">
              Current room: {currentRoom}
            </Typography>
          )}
        </Box>
      </Box>

      <List>
        {rooms.map((room) => (
          <ListItem
            button
            key={room.id}
            onClick={() => joinRoom(room.name)}
            sx={{
              backgroundColor: currentRoom === room.id ? 'action.hover' : 'transparent',
            }}
          >
            <Avatar>{room.id === 0 ? <Person /> : <GroupAdd />}</Avatar>
            <ListItemText
              primary={room.name}
              secondary={
                lastMessages[room.id]?.message ? 
                  `${lastMessages[room.id].message} • ${lastMessages[room.id].time}` : 
                  `${room.participants} participants`
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
