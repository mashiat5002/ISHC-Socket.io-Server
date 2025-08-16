const rooms = new Map();
const allUsers = new Map();
function createRoom(roomId){
    if(!rooms.has(roomId)){ //later ,also check if roomId exists and status is ongoing
        rooms.set(roomId, new Set());
    }
}
function endRoom(roomId){
    if(rooms.has(roomId)){ 
        // change the roomId status to ended
        rooms.delete(roomId);
    }
}
function addParticipant(roomId, participantId, fullName, socketId){
    createRoom(roomId); // Create room if it doesn't exist
    const Participants= rooms.get(roomId);
    if(!Participants.has(participantId)){
        allUsers.set(participantId, 
        {
            roomId: roomId, 
            socketId:socketId,
            fullName: fullName, 
            isMute:false, 
            isVideoOn:true
        });
        Participants.add(participantId);
        rooms.set(roomId, Participants);
        
    }
    else{
        // Update socketId if participant already exists
        const user = allUsers.get(participantId);
        user.socketId = socketId;
        allUsers.set(participantId, user);
    }
    console.log("after adding participant:");
        console.log("rooms:", (rooms));
    console.log("allUsers:", (allUsers));
}
function removeParticipant(socketId){
    for (const [roomId, participants] of rooms.entries()) {
        for (const participantId of participants) {
            const user = allUsers.get(participantId);
            if (user && user.socketId === socketId) {
                participants.delete(participantId); // Remove participant from the room
                allUsers.delete(participantId); // Remove participant from allUsers map
                rooms.set(roomId, participants); // Update the room with the modified participants set
                return; // Exit after removing the participant
            }
        }
    }
        console.log("after removing participant:");
        console.log("rooms:", (rooms));
    console.log("allUsers:", (allUsers));
    
}

function handleAudioParticipant(participantId){
    const user= allUsers.get(participantId);
    if(user){
        user.isMute = !user.isMute; // Toggle mute status
        allUsers.set(participantId, user);
        return user;
    }
}
function handleVideoParticipant(participantId){
    const user= allUsers.get(participantId);
    if(user){
        user.isVideoOn = !user.isVideoOn; // Toggle video status
        allUsers.set(participantId, user);
        return user;
    }
}



module.exports = {
  createRoom,
  endRoom,
  addParticipant,
  removeParticipant,
  handleAudioParticipant,
  handleVideoParticipant
};
