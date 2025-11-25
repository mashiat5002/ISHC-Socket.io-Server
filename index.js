

import { encrypt, decrypt } from "./jwt_encrypt_decrypt.js";
import { addParticipant, removeParticipantFromRoom,getOtherParticipants, getSocketIdUsingUid, handleToggleAudioParticipant, handleToggleVideoParticipant, getUserInfoFromRoom, addChat, getChatStore } from "./recreation.js";
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
  // console.log("Received emit request:", req.body);
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

  socket.on('join-room', async({encodedTxt,onToggleSelfVideo,onToggleSelfAudio}) => {
    console.log("encoooooooded",encodedTxt, onToggleSelfVideo,onToggleSelfAudio)
    const decryptedData= await decrypt(encodedTxt);
    const { meeting_id, id, full_name} = decryptedData;
    socket.join(meeting_id);
    addParticipant(meeting_id, id, full_name, socket.id, onToggleSelfVideo,onToggleSelfAudio);
 

  socket.emit('room-info', {
   existingParticipants: getOtherParticipants(meeting_id,id),
   socketId: socket.id,
   userId: id,
   full_name: full_name
  });

  
 });

socket.on("add-chat", async({encodedTxt,text}) => {
      const decryptedData = await decrypt(encodedTxt);
      const { meeting_id, full_name } = decryptedData;
  console.log("meeting_id, full_name")
  console.log(meeting_id, full_name, text)
         const chatEntry=addChat(meeting_id,full_name,text);
         io.to(meeting_id).emit("new-chat-added", chatEntry);

});
socket.on("get-all-chats", async({encodedTxt}) => {
      const decryptedData = await decrypt(encodedTxt);
      const { meeting_id } = decryptedData;

         const chatStore= getChatStore(meeting_id)
         console.log(chatStore)
         io.to(meeting_id).emit("receive-all-chats", chatStore);

});





socket.on("disconnecting", () => {
  for (const roomId of socket.rooms) {
    if (roomId === socket.id) continue; // skip the socket's personal room

    const removedId= removeParticipantFromRoom(roomId, socket.id);
    console.log("removedId")
    console.log(removedId)
    socket.to(roomId).emit("user-disconnected", removedId);
  }
});










socket.on('audio_video_status_update', async(details) => {
  console.log("audio request:")
  console.log(details)
  console.log("audio request:") 
  const updatedInfo_= await getUserInfoFromRoom(details.room_id,details.userId);
  console.log(updatedInfo_)
  if(details.changeType=="audio")
    await handleToggleAudioParticipant(details.room_id,details.userId);
  else if(details.changeType=="video")
    await handleToggleVideoParticipant(details.room_id,details.userId);

  const updatedInfo= await getUserInfoFromRoom(details.room_id,details.userId);
  console.log("cllaed","audio_video_status_update",updatedInfo)
    io.to(details.room_id).emit("audio_video_status_update", {
      info: updatedInfo,
      id: details.userId
    });
});









// WebRTC signaling events
socket.on('webrtc-offer', ({ to, from, sourceUserName, offer,onToggleSelfVideo,onToggleSelfAudio }) => {
  const targetSocketId = getSocketIdUsingUid(to);
  console.log(`WebRTC offer from ${from} ${sourceUserName} to ${to}`);
    socket.to(targetSocketId).emit('webrtc-offer', { from, sourceUserName, offer,onToggleSelfVideo,onToggleSelfAudio }); // keep `from` as userId
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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});




