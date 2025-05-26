import { Box, List, ListItem, ListItemText, Avatar, Typography } from '@mui/material';
import { Person } from '@mui/icons-material';
import { useSocket } from '@/contexts/socket-context';

export const ChatSidebar = () => {
  const { currentRoom, joinRoom } = useSocket();
  const rooms = [
    { id: 'general', name: 'General', participants: 25 },
    { id: 'development', name: 'Development', participants: 18 },
    { id: 'design', name: 'Design', participants: 12 },
  ];

  return (
    <Box
      sx={{
        width: 280,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box p={2}>
        <Typography variant="h6" fontWeight="bold">
          Chat Rooms
        </Typography>
        {currentRoom && (
          <Typography variant="subtitle2" color="textSecondary">
            Current room: {currentRoom}
          </Typography>
        )}
      </Box>
      <List>
        {rooms.map((room) => (
          <ListItem
            button
            key={room.id}
            onClick={() => joinRoom(room.id)}
            sx={{
              backgroundColor: currentRoom === room.id ? 'action.hover' : 'transparent',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <Avatar>
              <Person />
            </Avatar>
            <ListItemText
              primary={room.name}
              secondary={`${room.participants} participants`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
