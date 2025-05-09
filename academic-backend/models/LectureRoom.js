const mongoose = require('mongoose');

// Define the schema for LectureRoom
const lectureRoomSchema = new mongoose.Schema({
  room_id: {
    type: String,
    unique: true,
    required: true,
    default: () => `ROOM-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Auto-generated unique ID
  },
  roomName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true, // e.g., "Science Building, Floor 3"
  },
  capacity: {
    type: Number,
    required: true,
  },
  room_type: {
    type: String,
    required: true,
    enum: [
      'Lecture Hall',
      'Computer Lab',
      'Auditorium',
      'BYOD Lab',
      'Conference Room',
    ], // Dropdown options
  },
  available_equipments: {
    type: [String],
    required: true,
    default: [],
    enum: ['Projectors', 'Whiteboard', 'Smartboard', 'Computers', 'Podium', 'Audio System'], // Updated equipment options
  },
  quantity: {
    type: Object,
    default: {
      Projectors: 0,
      Whiteboard: 0,
      Smartboard: 0,
      Computers: 0,
      Podium: 0,
    }, // Quantities for each equipment (except Audio System)
  },
  seating_type: {
    type: String,
    required: true,
    enum: ['Fixed Seating', 'Flexible Seating', 'Lab Workstations'], // Dropdown options
  },
  air_conditioning: {
    type: Boolean,
    required: true,
    default: false, // Checkbox: yes (true) / no (false)
  },
  power_outlets: {
    type: Number,
    required: true,
    default: 0, // Number of power outlets
  },
  condition: {
    type: String,
    required: true,
    enum: ['Excellent', 'Good', 'Needs to Repair'], // Dropdown options for condition
  },
  faculty: {
    type: String,
    required: true, // Stores the selected department or custom department name if "Other" is chosen
  },
  addedBy: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  utilization: {
    type: Number,
    default: 0, // Placeholder for utilization percentage
  },
}, { timestamps: true }); // Enable timestamps to automatically manage createdAt and updatedAt

// Export the model
module.exports = mongoose.model('LectureRoom', lectureRoomSchema);