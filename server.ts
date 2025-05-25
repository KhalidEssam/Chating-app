import http from 'http';
import { Server, Socket } from 'socket.io';

interface ConnectedUser {
  id: string;
  name: string;
  phoneNumber?: string;
}

const PORT = process.env.PORT || 3001;
const connectedUsers: ConnectedUser[] = [];

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// io.on('connection', (socket: Socket) => {
//   console.log('Client connected:', socket.id);
  
//   socket.on('identify', (userData: { name: string; phoneNumber?: string }) => {
//     console.log('User identification received:', userData);
    
//     // Store user data
//     const user: ConnectedUser = {
//       id: socket.id,
//       name: userData.name,
//       phoneNumber: userData.phoneNumber
//     };
    
//     connectedUsers.push(user);
    
//     // Confirm identification
//     socket.emit('identification-confirmed', {
//       name: userData.name,
//       phoneNumber: userData.phoneNumber
//     });
//   });

  
  

//   socket.on('message', (msg) => {
//     console.log('Server received message:', msg);
//     // Add sender ID to the message
//     const sender = connectedUsers.find(u => u.id === socket.id);
//     if (!sender) return;

//     io.emit('message', {
//       ...msg,
//       timestamp: new Date().toISOString(),
//       sender: {
//         id: socket.id,
//         name: sender.name,
//         phoneNumber: sender.phoneNumber
//       }
//     });
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//     // Remove user from connected users
//     connectedUsers.splice(connectedUsers.findIndex(u => u.id === socket.id), 1);
//   });

//   socket.on('error', (err) => {
//     console.error('Socket error:', err);
//   });
// });



// server.ts


io.on('connection', (socket: Socket) => {
  console.log('Client connected:', socket.id);
  console.log('Connection origin:', socket.handshake.headers.origin);
  
  socket.on('identify', (userData: { name: string; phoneNumber?: string }) => {
    console.log('User identification received:', userData);
    console.log('Identifying socket:', socket.id);
    
    // Store user data
    const user: ConnectedUser = {
      id: socket.id,
      name: userData.name,
      phoneNumber: userData.phoneNumber
    };
    
    connectedUsers.push(user);
    
    // Confirm identification
    socket.emit('identification-confirmed', {
      name: userData.name,
      phoneNumber: userData.phoneNumber
    });
  });

    socket.on('message', (msg) => {
    console.log('Server received message:', msg);
    // Add sender ID to the message
    const sender = connectedUsers.find(u => u.id === socket.id);
    if (!sender) return;

    io.emit('message', {
      ...msg,
      timestamp: new Date().toISOString(),
      sender: {
        id: socket.id,
        name: sender.name,
        phoneNumber: sender.phoneNumber
      }
    });
  });


  // Add this to track disconnections
  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
    // Remove user from connected users
    connectedUsers.splice(connectedUsers.findIndex(u => u.id === socket.id), 1);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

