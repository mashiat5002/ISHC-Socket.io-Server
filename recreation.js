const  getParticipantsForSeminar= require('./isRegisteredParticipant.js');
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
    console.log("rooms:", (rooms));
    console.log("allUsers:", (allUsers));
}
function removeParticipant(roomId, participantId){
    const Participants= rooms.get(roomId);
    if(Participants.has(participantId)){
        Participants.delete(participantId);
        rooms.set(roomId, Participants);
    }
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
