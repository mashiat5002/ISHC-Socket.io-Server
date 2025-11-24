// room-manager.ts
// Keeps the same external API as your original file but supports room-specific user details.

// rooms: Map<roomId, Set<participantId>>
const rooms = new Map();
// allUsers: Map<participantId, Map<roomId, userDetails>>
const allUsers = new Map();

const roomChats = new Map();
/**
 * userDetails shape:
 * {
 *   roomId: string,
 *   socketId: string,
 *   fullName: string,
 *   isAudioOff: boolean,
 *   isVideoOff: boolean
 * }
 */

/* Create a room (if not exists) */
export function createRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
}

/* End/Delete a room */
export function endRoom(roomId) {
  if (rooms.has(roomId)) {
    // remove all room-specific user entries from allUsers
    const participants = rooms.get(roomId);
    for (const pid of participants) {
      const perUserMap = allUsers.get(pid);
      if (perUserMap) {
        perUserMap.delete(roomId);
        if (perUserMap.size === 0) {
          allUsers.delete(pid);
        } else {
          allUsers.set(pid, perUserMap);
        }
      }
    }
    rooms.delete(roomId);
  }
}

/* Add or update a participant for a specific room (room-scoped details).
   Keeps the same signature as before.
*/
export function addParticipant(
  roomId,
  participantId,
  fullName,
  socketId,
  onToggleSelfVideo,
  onToggleSelfAudio
) {
    console.log("onToggleSelfAudio,onToggleSelfVideo") 
    console.log(onToggleSelfAudio,onToggleSelfVideo)
  createRoom(roomId); // Create room if it doesn't exist
  const participants = rooms.get(roomId);


  // ensure per-user map exists
  if (!allUsers.has(participantId)) {
    allUsers.set(participantId, new Map());
  }
  const perUserMap = allUsers.get(participantId);

  // compute booleans based on passed strings (same interpretation as original)
  // Note: keep the same mapping you had earlier if you want parity:
  // original used onToggleSelfVideo -> isAudioOff and onToggleSelfAudio -> isVideoOff (seemed swapped)
  // Here we assume the intended mapping: onToggleSelfAudio -> isAudioOff, onToggleSelfVideo -> isVideoOff
  // If you want exact previous bug parity, swap them back.      
const isAudioOff = onToggleSelfAudio ?? false;
const isVideoOff = onToggleSelfVideo ?? false;

 console.log("created with:", isAudioOff, isVideoOff)
  const userDetails = {
    roomId,
    socketId,
    fullName,
    isAudioOff,
    isVideoOff,
  };

  // set/update user details for this room
  perUserMap.set(roomId, userDetails);
  allUsers.set(participantId, perUserMap);

  // add participant id to room set
  participants.add(participantId);
  rooms.set(roomId, participants);

  console.log("rooms:", rooms);
  // Note: allUsers structure will show per-room maps for each participant
}

/* Remove participant from a specific room by socketId (keeps same behavior) */
export function removeParticipantFromRoom(roomId, socketId) {
  const participants = rooms.get(roomId);
  if (!participants) return null; // no room found

  let removedParticipantId = null;

  // Find matching participantId by socketId within that room
  for (const participantId of Array.from(participants)) {
    const perUserMap = allUsers.get(participantId);
    if (!perUserMap) continue;
    const userInfo = perUserMap.get(roomId);
    if (userInfo && userInfo.socketId === socketId) {
      // remove participant from room set
      participants.delete(participantId);

      // remove room entry from allUsers map for this participant
      perUserMap.delete(roomId);
      if (perUserMap.size === 0) {
        allUsers.delete(participantId);
      } else {
        allUsers.set(participantId, perUserMap);
      }

      removedParticipantId = participantId;
      break;
    }
  }

  // Delete the room if empty
  if (participants.size === 0) {
    rooms.delete(roomId);
  } else {
    rooms.set(roomId, participants);
  }

  return removedParticipantId;
}

/* Toggle audio for participant but only for the specified room */
export function handleToggleAudioParticipant(roomId, participantId) {
  console.log("Audio toggle requested:");

  // room must exist
  if (!rooms.has(roomId)) return null;
  const participants = rooms.get(roomId);

  // participant must exist in this room
  if (!participants.has(participantId)) return null;

  const perUserMap = allUsers.get(participantId);
  if (!perUserMap) return null;

  const user = perUserMap.get(roomId);
  if (!user) return null;

  user.isAudioOff = !user.isAudioOff;
  perUserMap.set(roomId, user);
  allUsers.set(participantId, perUserMap);

  return user;
}

/* Toggle video for participant but only for the specified room */
export function handleToggleVideoParticipant(roomId, participantId) {
  console.log("Video toggle requested:");

  // room must exist
  if (!rooms.has(roomId)) return null;
  const participants = rooms.get(roomId);

  // participant must exist in this room
  if (!participants.has(participantId)) return null;

  const perUserMap = allUsers.get(participantId);
  if (!perUserMap) return null;

  const user = perUserMap.get(roomId);
  if (!user) return null;

  user.isVideoOff = !user.isVideoOff;
  perUserMap.set(roomId, user);
  allUsers.set(participantId, perUserMap);

  return user;
}

/* Get other participants in a room except the given id */
export function getOtherParticipants(meeting_id, id) {
  const others = [];

  const roomSet = rooms.get(meeting_id) || new Set();
  const roomUsers = Array.from(roomSet).filter((participantId) => participantId !== id);

  // gather per-room user info from allUsers
  for (const participantId of roomUsers) {
    const perUserMap = allUsers.get(participantId);
    if (!perUserMap) continue;
    const userInfo = perUserMap.get(meeting_id);
    if (!userInfo) continue;
    others.push({ id: participantId, ...userInfo });
  }

  return others;
}

/* Get socketId using uid (returns socketId from any room entry if multiple) */
export function getSocketIdUsingUid(uid) {
  const perUserMap = allUsers.get(uid);
  if (!perUserMap) return null;

  // return socketId from first room entry (consistent with previous single-entry approach)
  for (const [, userInfo] of perUserMap.entries()) {
    if (userInfo && userInfo.socketId) return userInfo.socketId;
  }
  return null;
}

/* Get specific user information from specific room */
export function getUserInfoFromRoom(roomId, participantId) {
  // Check if the room exists
  if (!rooms.has(roomId)) {
    console.warn(`Room ${roomId} not found.`);
    return null;
  }

  const participants = rooms.get(roomId);

  // Check if the user exists in this room
  if (!participants.has(participantId)) {
    console.warn(`User ${participantId} not found in room ${roomId}.`);
    return null;
  }

  // Retrieve per-room user info from allUsers
  const perUserMap = allUsers.get(participantId);
  if (!perUserMap) {
    console.warn(`User ${participantId} info not found in allUsers map.`);
    return null;
  }

  const userInfo = perUserMap.get(roomId);
  if (!userInfo) {
    console.warn(`User ${participantId} has no entry for room ${roomId}.`);
    return null;
  }

  return userInfo; // return the user details object
}


function ensureChatRoom(roomId) {
  if (!roomChats.has(roomId)) {
    roomChats.set(roomId, []);
  }
}


/** Add chat message to room */
export function addChat(roomId, full_name, text) {
  createRoom(roomId);
  ensureChatRoom(roomId);

  const chatEntry = {
    full_name,
    text,
    time: new Date().toISOString(),
  };

  roomChats.get(roomId).push(chatEntry);

  return chatEntry;
}




/** Get entire chat history of a room */
export function getChatStore(roomId) {
  if (!roomChats.has(roomId)) return [];
  return roomChats.get(roomId);
}