const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  roomName: String,
  eventType: String,
  customEventType: String,
  eventName: String,
  code: String, // ✅ added course code
  faculty: String,
  department: String,
  date: Date,
  startTime: String,
  duration: Number,
  recurrence: String,
  recurrenceFrequency: String,
  priorityLevel: String,
  createdBy: String,
  email: String,
});

module.exports = mongoose.model('Timetable', timetableSchema);
