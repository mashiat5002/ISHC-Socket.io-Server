const mongoose = require("mongoose");

// Sub-schema for participants
const ParticipantsDetailsSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    name: { type: String, required: true },
    motive: { type: String, required: true },
  },
  { _id: false }
);

// Main schema for ScheduledSeminars
const ScheduledSeminarsSchema = new mongoose.Schema({
  expert_id: { type: String, required: true },
  speaker: { type: String, required: true },
  description: { type: String, required: true },
  meeting_topic: { type: String, required: true },
  Creation_time: { type: Date, default: Date.now },
  Scheduled_time: { type: Date, required: true },
  max_Participants: { type: String },
  registed_participants: { type: Number, default: 0 },
  duration: { type: String },
  status: { type: String, default: "upcoming" },
  topics: { type: [String] },
  participants: { type: [ParticipantsDetailsSchema], default: [] },
});

// Export model (reuse existing model if already registered)
const ScheduledSeminars =
  mongoose.models.ScheduledSeminars ||
  mongoose.model("ScheduledSeminars", ScheduledSeminarsSchema);

module.exports = ScheduledSeminars;
