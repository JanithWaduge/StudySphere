const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID package
const LectureRoom = require('./LectureRoom'); // Adjust the path to your LectureRoom model

// Helper function to calculate end time based on start time and duration
const calculateEndTime = function () {
  if (!this.startTime || !this.duration) return null;

  const [hours, minutes] = this.startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);

  const durationInMinutes = this.duration; // duration in minutes
  const endDate = new Date(startDate.getTime() + durationInMinutes * 60000); // Add duration in milliseconds

  const endHours = String(endDate.getHours()).padStart(2, '0');
  const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
  return `${endHours}:${endMinutes}`; // e.g., "14:30"
};

// Helper function to determine room status based on room condition
const getRoomStatus = async function () {
  const roomName = this.roomName;
  try {
    const room = await LectureRoom.findOne({ roomName });
    if (!room) {
      return 'Not specified (Room not found)';
    }

    return room.condition === 'Needs to Repair' ? 'Under Maintenance' : 'Occupied';
  } catch (error) {
    return 'Occupied (Error fetching room)';
  }
};

const scheduleSchema = new mongoose.Schema({
  scheduleId: {
    type: String,
    required: [true, 'Schedule ID is required'],
    unique: true, // Ensure uniqueness
    default: uuidv4, // Auto-generate using UUID
  },
  roomName: {
    type: String,
    required: [true, 'Room name is required'],
    match: [/^[A-Z][0-9]{3}$/, 'Room name must be in the format A000 (e.g., A401)'],
  },
  eventType: {
    type: String,
    enum: ['Lecture', 'Exam', 'Meeting', 'Seminar/Workshop', 'Other'],
    required: [true, 'Event type is required'],
  },
  customEventType: {
    type: String,
    required: function () {
      return this.eventType === 'Other';
    },
    maxLength: [20, 'Custom event type must not exceed 20 characters'],
  },
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxLength: [20, 'Event name must not exceed 20 characters'],
    match: [/^[a-zA-Z0-9\s]+$/, 'Event name can only include letters, numbers, and spaces'],
  },
  faculty: {
    type: String,
    enum: ['Computing', 'Engineering', 'Architecture', 'Science', 'Hospitality', 'Business', 'Arts'],
    required: [true, 'Faculty is required'],
  },
  department: {
    type: String,
    enum: ['Computer Science', 'Information Technology', 'Software Engineering', 'Cyber Security','Data Science', 'Interactive Media', 
      'Network Engineering', 'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Electronic Engineering', 
      'Chemical Engineering', 'Mechatronics Engineering','Bio Medical Engineering', 'Mathematics','Physics', 'Chemistry', 'Biology','Microbiology', 
      'Statistics', 'Accounting', 'Finance', 'Marketing', 'Human Resource Management', 'Management / Business Management','Economics', 'Creative & Performing Arts',
      'Humanities & Social Sciences', 'Languages & Literature', 'Communication & Culture', 'Creative & Performing Arts', 'Other'],
    required: [true, 'Department is required'],
    
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  startTime: {
    type: String, // Format: "HH:MM" (e.g., "09:00")
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'],
  },
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
  },
  endTime: {
    type: String, // Format: "HH:MM"
    default: calculateEndTime, // Auto-calculated based on startTime and duration
  },
  recurrence: {
    type: String,
    enum: ['Yes', 'No'],
    required: [true, 'Recurrence selection is required'],
    default: 'No',
  },
  recurrenceFrequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    required: function () {
      return this.recurrence === 'Yes';
    },
  },
  priorityLevel: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    required: [true, 'Priority level is required'],
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Under Maintenance'],
    default: 'Occupied', // Will be overridden in pre-save middleware
  },
  createdBy: {
    type: String,
    required: [true, 'Created by is required'],
    trim: true,
    maxLength: [20, 'Created by must not exceed 20 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    maxLength: [50, 'Email must not exceed 50 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to current timestamp
  },
});

// Pre-save middleware to calculate endTime and set status
scheduleSchema.pre('save', async function (next) {
  try {
    // Calculate endTime
    this.endTime = calculateEndTime.call(this);

    // Set status based on room condition
    this.status = await getRoomStatus.call(this);

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);