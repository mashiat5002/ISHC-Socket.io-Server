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

app.get('/', (req, res) => {
  res.send('Socket.io server is running!');
});

// Track users in each room
const roomUsers = new Map(); // roomId => Set of socket ids
const meetingChats = new Map(); // roomId => Array of chat messages


io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
 
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }
    const users = roomUsers.get(roomId);
    users.add(socket.id);

    // Send room info to the joining user
    socket.emit('room-info', {
      existingUsers: [...users].filter(id => id !== socket.id)
    });
  });

  socket.on("send-chat", ({message , roomId }) => {
    console.log(`Received chat message in room ${roomId}:`, message);
    const senderId = socket.id;
    const AllroomUsers = roomUsers.get(roomId) || new Set();

    if (!meetingChats.has(roomId)) {
      meetingChats.set(roomId, []);
    }

    meetingChats.get(roomId).push(message);

    AllroomUsers.forEach((userId) => {
      socket.to(userId).emit('receive-chat', { messages: meetingChats.get(roomId) });
    });

  });

   socket.on('disconnecting', () => {
    // Remove user from all rooms they are in
    for (const roomId of socket.rooms) {
      if (roomUsers.has(roomId)) {
        const users = roomUsers.get(roomId);
        users.delete(socket.id);
        if (users.size === 0) {
          roomUsers.delete(roomId);
        }
      }
    }
    console.log('User disconnected:', socket.id);
  });


  // WebRTC signaling events (broadcast to room except sender)
  socket.on('webrtc-offer', ({ to, from, offer }) => {
    // console.log(`WebRTC offer from ${from} to ${to}:`, offer);


    socket.to(to).emit('webrtc-offer', { from: from, offer });
  });

  socket.on('webrtc-answer', ({ to, answer, from }) => {
    // console.log(`WebRTC answer from ${from} to ${to}:`, answer);

    socket.to(to).emit('webrtc-answer', { from: from, answer });
  });

  socket.on('webrtc-ice-candidate', ({ to, from, candidate }) => {
    // console.log(`WebRTC ICE candidate from ${from} to ${to}:`, candidate);
    socket.to(to).emit('webrtc-ice-candidate', { from: from, candidate });
  });


    
  });





 
 

  


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});