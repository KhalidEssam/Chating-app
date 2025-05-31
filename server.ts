import http from 'http';
import { Server, Socket } from 'socket.io';
import axios from 'axios';

interface ConnectedUser {
  id: string;
  name: string;
  phoneNumber?: string;
}

interface Message {
  content: string;
  room: string;
  timestamp: string;
  sender: ConnectedUser;
}

const PORT = process.env.PORT || 3001;
const connectedUsers: ConnectedUser[] = [];
const roomMessages: Record<string, Message[]> = {}; // Room-based message history

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket: Socket) => {
  console.log('Client connected:', socket.id);
  console.log('Connection origin:', socket.handshake.headers.origin);

  // Identify user
  socket.on('identify', (userData: { name: string; phoneNumber?: string }) => {
    console.log('User identification received:', userData);

    const user: ConnectedUser = {
      id: socket.id,
      name: userData.name,
      phoneNumber: userData.phoneNumber,
    };

    // Prevent duplicates
    if (!connectedUsers.some((u) => u.id === socket.id)) {
      connectedUsers.push(user);
    }

    socket.emit('identification-confirmed', {
      name: userData.name,
      phoneNumber: userData.phoneNumber,
    });
  });

  socket.on('join-room', async (roomId: string, token: string) => {
    if (socket.rooms.has(roomId) || !token ||!roomId) return;
  
    socket.join(roomId);
    socket.emit('room-joined', roomId);    
  
    try {
      const res = await axios.get(`http://localhost:3002/messages/room/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const history = res.data || [];
      socket.emit('room-history', history, roomId);
    } catch (error) {
      console.error('Failed to fetch message history:', error);
      socket.emit('room-history', [], roomId);
    }
  });

  // Leave all rooms except socket.id
  socket.on('leave-room', () => {
    console.log('Leaving all rooms for socket:', socket.id);
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.leave(room);
      }
    }
    socket.emit('room-left');
  });

  // Send Message
  socket.on('send-message', (msg) => {
    const sender = connectedUsers.find((u) => u.id === socket.id);
    if (!sender || !msg.room) return;

    const fullMessage: Message = {
      content: msg.content,
      room: msg.room,
      timestamp: new Date().toISOString(),
      sender,
    };

    if (!roomMessages[msg.room]) {
      roomMessages[msg.room] = [];
    }
    roomMessages[msg.room].push(fullMessage);

    // Send to others in room
    socket.to(msg.room).emit('message', fullMessage);

    // Also send to sender
    socket.emit('message', fullMessage);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
    const index = connectedUsers.findIndex((u) => u.id === socket.id);
    if (index !== -1) {
      connectedUsers.splice(index, 1);
    }
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

httpServer.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on port ${PORT}`);
});
