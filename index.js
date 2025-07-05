io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }
    const users = roomUsers.get(roomId);
    users.add(socket.id);

    socket.emit('room-info', {
      existingUsers: [...users].filter(id => id !== socket.id)
    });
  });

  socket.on("send-chat", ({ message, roomId }) => {
    const senderId = socket.id;
    const AllroomUsers = roomUsers.get(roomId) || new Set();

    if (!meetingChats.has(roomId)) {
      meetingChats.set(roomId, []);
    }

    meetingChats.get(roomId).push({ msg: message, sender: senderId });

    AllroomUsers.forEach((userId) => {
      socket.to(userId).emit('receive-chat', {
        messages: meetingChats.get(roomId)
      });
    });
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
    console.log('User disconnected:', socket.id);
  });

  socket.on('webrtc-offer', ({ to, from, offer }) => {
    socket.to(to).emit('webrtc-offer', { from, offer });
  });

  socket.on('webrtc-answer', ({ to, from, answer }) => {
    socket.to(to).emit('webrtc-answer', { from, answer });
  });

  socket.on('webrtc-ice-candidate', ({ to, from, candidate }) => {
    socket.to(to).emit('webrtc-ice-candidate', { from, candidate });
  });
});
