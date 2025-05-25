import { Box, List, ListItem, ListItemText, Avatar, Typography } from '@mui/material';
import { Person } from '@mui/icons-material';

export const ChatSidebar = () => {
  const rooms = [
    { id: 1, name: 'General', participants: 25 },
    { id: 2, name: 'Development', participants: 18 },
    { id: 3, name: 'Design', participants: 12 },
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
      </Box>
      <List>
        {rooms.map((room) => (
          <ListItem button key={room.id}>
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
