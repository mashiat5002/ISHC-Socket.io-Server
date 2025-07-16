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




app.post("/join", (req, res) => {
  console.log("Received join request:", req.body);
  const { roomId, user_name ,socketId } = req.body;

  userStore[socketId] = { name: user_name,  roomId: roomId };
  console.log("User store:", userStore);


  res.status(200).json({ ok: true });
});



// Track users in each room
const roomUsers = new Map(); // roomId => Set of socket ids
const userStore = {};


const meetingChats = new Map(); // roomId => Array of chat messages
io.on('connection', (socket) => {  
  console.log('A user connected:', socket.id);


//  socket.to(roomId).emit('new-comer', {
//       new_comer: socket.id,
//     });


  socket.on('join-room', (roomId) => {
    console.log(userStore, "User store before joining room:", userStore);
    socket.join(roomId);
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }
    const users = roomUsers.get(roomId);
    users.add(socket.id);


    socket.emit("send-previous-chats", {
      msg: meetingChats.get(roomId) || []
    });


    socket.on("send-notes", (msg)=>{
      console.log("send notes called")
      io.emit("receive-notes",msg)

    });





   socket.to(roomId).emit("update-elementsRef-for-users", {

  users: [...users].filter(userId => userId !== socket.id)
});


   socket.to(roomId).emit("add-new-userDetails", {
    existingUsers: [...users],
  updatedUserDetails: userStore,
  new_userId:socket.id
});


  socket.emit('room-info', {
      existingUsers: [...users],
      existingUserDetails: userStore
    });
  


    // Send room info to the joining user
    
    
  });

// ok
socket.on('disconnecting', () => {
  for (const roomId of socket.rooms) {
    if (roomUsers.has(roomId)) {
      const users = roomUsers.get(roomId);
      users.delete(socket.id);
      if (users.size === 0) {
        roomUsers.delete(roomId);
      }
    }
    // Emit user-disconnected to all other users in this room
    socket.to(roomId).emit('user-disconnected', {
      userId: socket.id,
    });
  }
  delete userStore[socket.id];
  console.log('User disconnected:', socket.id);
});
 
  //   socket.on("send-chat", ({msg , roomId }) => {
    
    


  //   if (!meetingChats.has(roomId)) {
  //     meetingChats.set(roomId, []);
  //   }


  //   meetingChats.get(roomId).push(msg);
  //   // console.log("Chat messages in room:", roomId);
  //   // console.log(meetingChats.get(roomId));
  //   AllroomUsers.forEach((userId) => {
  //     socket.to(userId).emit('receive-chat', { msg: msg });
  //   });


  // });












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


