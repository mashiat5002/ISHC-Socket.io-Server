const rooms = new Map();
const allUsers = new Map();
export function createRoom(roomId){
    if(!rooms.has(roomId)){ //later ,also check if roomId exists and status is ongoing
        rooms.set(roomId, new Set());
    }
}
export function endRoom(roomId){
    if(rooms.has(roomId)){ 
        // change the roomId status to ended
        rooms.delete(roomId);
    }
}
export function addParticipant(roomId, participantId, fullName, socketId){
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
        console.log(user)
        console.log(socketId)
        user.socketId = socketId;
        allUsers.set(participantId, user);
    }
        // console.log("after adding participant:");
        console.log("rooms:", (rooms));
        // console.log("allUsers:", (allUsers));
}
export function removeParticipant(socketId){
    for (const [roomId, participants] of rooms.entries()) {
        for (const participantId of participants) {
            const user = allUsers.get(participantId);
            if (user && user.socketId === socketId) {
                participants.delete(participantId); // Remove participant from the room
                allUsers.delete(participantId); // Remove participant from allUsers map
                rooms.set(roomId, participants); // Update the room with the modified participants set
                rooms.forEach((room)=>{
                    if(room.size === 0){
                        rooms.delete(roomId);
                    }
                })
                console.log("after disconnection ,rooms:", (rooms));
                return; // Exit after removing the participant
            }
        }
    }
    
}

export function handleAudioParticipant(participantId){
    const user= allUsers.get(participantId);
    if(user){
        user.isMute = !user.isMute; // Toggle mute status
        allUsers.set(participantId, user);
        return user;
    }
}
export function handleVideoParticipant(participantId){
    const user= allUsers.get(participantId);
    if(user){
        user.isVideoOn = !user.isVideoOn; // Toggle video status
        allUsers.set(participantId, user);
        return user;
    }
}

export function getOtherParticipants(meeting_id, id) {
    const others = [];

    // Get all users in this room except the current one
    const roomUsers = Array.from(rooms.get(meeting_id) || []).filter(
        participantId => participantId !== id
    );

    // Loop through allUsers (Map)
    for (const [key, value] of allUsers) {
        if (!roomUsers.includes(key)) continue;

        // Add both id (key) and full user info
        others.push({ id: key, ...value });
    }

    return others;
}



export function getSocketIdUsingUid(uid) {
    const user = allUsers.get(uid);
    return user ? user.socketId : null;
}




