const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for all origins (you can restrict this in production)
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Simple health check endpoint
app.get('/', (req, res) => {
  res.send('Socket.io server is running!');
});

// roomId => Set of socket IDs
const roomUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 New connection: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);

    // Add to room tracking
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }

    const users = roomUsers.get(roomId);
    users.add(socket.id);

    // Tell the new user who else is in the room
    socket.emit('room-info', {
      existingUsers: [...users].filter(id => id !== socket.id)
    });

    console.log(`🟢 ${socket.id} joined room ${roomId}`);
    console.log(`Current users in room ${roomId}:`, [...users]);
  });

  socket.on('webrtc-offer', ({ roomId, offer, to }) => {
    console.log(`📨 Offer from ${socket.id} to ${to} in room ${roomId}`);
    io.to(to).emit('webrtc-offer', { offer, from: socket.id });
  });

  socket.on('webrtc-answer', ({ roomId, answer, to }) => {
    console.log(`📨 Answer from ${socket.id} to ${to} in room ${roomId}`);
    io.to(to).emit('webrtc-answer', { answer, from: socket.id });
  });

  socket.on('webrtc-ice-candidate', ({ roomId, candidate, to }) => {
    console.log(`📨 ICE candidate from ${socket.id} to ${to}`);
    io.to(to).emit('webrtc-ice-candidate', { candidate, from: socket.id });
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomUsers.has(roomId)) {
        const users = roomUsers.get(roomId);
        users.delete(socket.id);
        if (users.size === 0) {
          roomUsers.delete(roomId);
        }
      }
    }

    console.log(`🔌 Disconnected: ${socket.id}`);
    console.log('🧾 Updated room users:', Object.fromEntries([...roomUsers].map(([k, v]) => [k, [...v]])));
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Socket.io server is running on port ${PORT}`);
});
