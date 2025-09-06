import { connectToDatabase } from "./connect_mongodb/connect_mongodb";
import ScheduledSeminars from "./models/scheduled_seminars";
 async function isRegisteredParticipant(seminarId, email) {

  await connectToDatabase()
  const seminar = await ScheduledSeminars.findOne({  _id: seminarId,
  participants: {
    $elemMatch: { email: email }
  }})
  if (!seminar) {
   return false
  }
  return true;
}

export default isRegisteredParticipant;