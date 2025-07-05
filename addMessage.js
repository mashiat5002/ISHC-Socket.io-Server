export default function addMessage(meetingId, message, meetingChats) {
  if (!meetingChats.has(meetingId)) {
    meetingChats.set(meetingId, []); // create array if it doesn't exist
  }

  meetingChats.get(meetingId).push(message);
}