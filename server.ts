import http from 'http';
import { Server, Socket } from 'socket.io';

const PORT = process.env.PORT || 3001;

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket: Socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('message', (msg) => {
    console.log('Server received message:', msg);
    // Add sender ID to the message
    io.emit('message', {
      ...msg,
      timestamp: new Date().toISOString(),
      senderId: socket.id
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
