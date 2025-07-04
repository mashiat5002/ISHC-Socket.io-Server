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

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Example: echo event
  socket.on('echo', (data) => {
    socket.emit('echo', data);
  });

  // WebRTC signaling events
  socket.on("webrtc-offer", (offer) => {
    socket.broadcast.emit("webrtc-offer", offer);
  });

  socket.on("webrtc-answer", (answer) => {
    socket.broadcast.emit("webrtc-answer", answer);
  });

  socket.on("webrtc-ice-candidate", (candidate) => {
    socket.broadcast.emit("webrtc-ice-candidate", candidate);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});