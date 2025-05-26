import http from 'http';
import { Server, Socket } from 'socket.io';

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
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket: Socket) => {
  console.log('Client connected:', socket.id);
  console.log('Connection origin:', socket.handshake.headers.origin);

  // Identification
  socket.on('identify', (userData: { name: string; phoneNumber?: string }) => {
    console.log('User identification received:', userData);

    const user: ConnectedUser = {
      id: socket.id,
      name: userData.name,
      phoneNumber: userData.phoneNumber
    };

    connectedUsers.push(user);

    socket.emit('identification-confirmed', {
      name: userData.name,
      phoneNumber: userData.phoneNumber
    });
  });

  // Join Room
  socket.on('join-room', (roomId: string) => {
    console.log(`Joining room: ${roomId}`);
    socket.join(roomId);

    // Emit confirmation
    socket.emit('room-joined', roomId);

    // Send existing message history for the room
    const history = roomMessages[roomId] || [];
    history.forEach((msg) => {
      socket.emit('message', msg);
    });
  });

  // Leave Room
  socket.on('leave-room', () => {
    console.log('Leaving all rooms except default for socket:', socket.id);
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
    socket.emit('room-left');
  });

  // Send Message
  socket.on('send-message', (msg) => {
    const sender = connectedUsers.find(u => u.id === socket.id);
    if (!sender || !msg.room) return;

    const fullMessage: Message = {
      content: msg.content,
      room: msg.room,
      timestamp: new Date().toISOString(),
      sender
    };

    // Save to room history
    if (!roomMessages[msg.room]) {
      roomMessages[msg.room] = [];
    }
    roomMessages[msg.room].push(fullMessage);

    // Broadcast to room (excluding sender)
    socket.to(msg.room).emit('message', fullMessage);

    // Also send to sender
    socket.emit('message', fullMessage);
  });

  // Handle Disconnection
  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
    const index = connectedUsers.findIndex(u => u.id === socket.id);
    if (index !== -1) connectedUsers.splice(index, 1);
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
