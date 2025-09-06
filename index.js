

import { encrypt, decrypt } from "./jwt_encrypt_decrypt.js";
import { addParticipant, removeParticipant,getOtherParticipants, getSocketIdUsingUid } from "./recreation.js";
import  express  from "express";
import http from "http";
import {Server} from "socket.io";
import cors from "cors";






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

  socket.on('join-room', async(token) => {
    const decryptedData= await decrypt(token);
    const { meeting_id, id, full_name} = decryptedData;
    socket.join(meeting_id);
    addParticipant(meeting_id, id, full_name, socket.id);


  socket.emit('room-info', {
   existingParticipants: getOtherParticipants(meeting_id,id),
   socketId: socket.id,
   userId: id,
   full_name: full_name
  });

  
 });

socket.on('disconnecting', () => {
  console.log("User disconnecting:", socket.id);
  removeParticipant(socket.id);
  // Notify each room that this user is leaving
      // socket.to(roomId).emit('user-disconnected', {
      // });
});












// WebRTC signaling events
socket.on('webrtc-offer', ({ to, from, offer }) => {
  console.log(`WebRTC offer from ${from} to ${to}`);
  const targetSocketId = getSocketIdUsingUid(to);
  if (targetSocketId) {
    socket.to(targetSocketId).emit('webrtc-offer', { from, offer }); // keep `from` as userId
  }
});

socket.on('webrtc-answer', ({ to, from, answer }) => {
  console.log(`WebRTC answer from ${from} to ${to}`);
  const targetSocketId = getSocketIdUsingUid(to);
  if (targetSocketId) {
    socket.to(targetSocketId).emit('webrtc-answer', { from, answer }); // keep `from` as userId
  }
});

socket.on('webrtc-ice-candidate', ({ to, from, candidate }) => {
  console.log(`WebRTC ICE candidate from ${from} to ${to}`);
  const targetSocketId = getSocketIdUsingUid(to);
  if (targetSocketId) {
    socket.to(targetSocketId).emit('webrtc-ice-candidate', { from, candidate }); // keep `from` as userId
  }
});

});


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


