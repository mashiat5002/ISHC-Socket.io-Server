const {addParticipant}= require('./recreation.js');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');


const app = express();
const server = http.createServer(app);


app.use(cors());
app.use(express.json()); 





const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});


app.get('/', (req, res) => {
  res.send('Socket.io server is running!');
});


app.post("/emit", (req, res) => {
  console.log("Received emit request:", req.body);
  const { roomId, detailed_Message } = req.body;


   if (!meetingChats.has(roomId)) {
      meetingChats.set(roomId, []);
    }


    meetingChats.get(roomId).push(detailed_Message);
    io.to(roomId).emit("receive-chat", { msg: detailed_Message });
  res.status(200).json({ ok: true });
});






const meetingChats = new Map(); // roomId => Array of chat messages
io.on('connection', (socket) => {  
  console.log('A user connected:', socket.id);

  socket.on('join-room', (roomId, participantId, fullName, socketId) => {
    addParticipant(roomId, participantId, fullName, socketId);
    console.log("User joined room:", roomId, "Participant ID:", participantId, "Full Name:", fullName, "Socket ID:", socketId);
  });

// ok
socket.on('disconnecting', () => {
  // Notify each room that this user is leaving

  
      socket.to(roomId).emit('user-disconnected', {
     
      });

    
  
});

 










  // WebRTC signaling events (broadcast to room except sender)
  socket.on('webrtc-offer', ({ to, from, offer }) => {
    console.log(`WebRTC offer from ${from} to ${to}:`);




    socket.to(to).emit('webrtc-offer', { from: from, offer });
  });


  socket.on('webrtc-answer', ({ to, answer, from }) => {
    console.log(`WebRTC answer from ${from} to ${to}:`);


    socket.to(to).emit('webrtc-answer', { from: from, answer });
  });


  socket.on('webrtc-ice-candidate', ({ to, from, candidate }) => {
    console.log(`WebRTC ICE candidate from ${from} to ${to}:`);
    socket.to(to).emit('webrtc-ice-candidate', { from: from, candidate });
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


