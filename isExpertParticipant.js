const { connectToDatabase } = require("./connect_mongodb/connect_mongodb");
const ScheduledSeminars = require("./models/scheduled_seminars");
 async function isExpertParticipant(seminarId, expert_id) {

  await connectToDatabase()
  const seminar = await ScheduledSeminars.findOne({  _id: seminarId,expert_id: expert_id })
  if (!seminar) {
   return false
  }
  return true;
}


module.exports = isExpertParticipant;