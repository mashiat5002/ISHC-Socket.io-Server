const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Room management
const roomUsers = new Map();           // roomId => Set of socket IDs
const meetingChats = new Map();        // roomId => Array of chat messages

app.get('/', (req, res) => {
  res.send('Socket.io server is running!');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);

    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }

    const users = roomUsers.get(roomId);
    users.add(socket.id);

    // Send previous chats
    socket.emit("send-previous-chats", {
      msg: meetingChats.get(roomId) || []
    });

    // ✅ Send room info only to the joining user, excluding themselves
    socket.emit('room-info', {
      existingUsers: [...users].filter(id => id !== socket.id),
      existingChats: meetingChats.get(roomId) || []
    });

    // ✅ Notify other users in the room that a new user joined
    socket.to(roomId).emit('user-joined', { userId: socket.id });
  });

  socket.on('send-chat', ({ msg, roomId }) => {
    const allUsers = roomUsers.get(roomId) || new Set();

    if (!meetingChats.has(roomId)) {
      meetingChats.set(roomId, []);
    }

    meetingChats.get(roomId).push(msg);

    // Broadcast to everyone in the room except sender
    socket.to(roomId).emit('receive-chat', { msg });
  });

  // ✅ WebRTC signaling handlers
  socket.on('webrtc-offer', ({ to, from, offer }) => {
    if (to !== from) {
      console.log(`WebRTC offer from ${from} to ${to}`);
      socket.to(to).emit('webrtc-offer', { from, offer });
    }
  });

  socket.on('webrtc-answer', ({ to, from, answer }) => {
    console.log(`WebRTC answer from ${from} to ${to}`);
    socket.to(to).emit('webrtc-answer', { from, answer });
  });

  socket.on('webrtc-ice-candidate', ({ to, from, candidate }) => {
    if (to !== from) {
      console.log(`WebRTC ICE candidate from ${from} to ${to}`);
      socket.to(to).emit('webrtc-ice-candidate', { from, candidate });
    }
  });

  // ✅ Handle disconnect
  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomUsers.has(roomId)) {
        const users = roomUsers.get(roomId);
        users.delete(socket.id);

        if (users.size === 0) {
          roomUsers.delete(roomId);
        } else {
          // Notify others in the room that a user left
          socket.to(roomId).emit('user-left', { userId: socket.id });
        }
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
