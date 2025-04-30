const Schedule = require('../models/Schedule');
const LectureRoom = require('../models/LectureRoom');

// Get all schedules
const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Error fetching schedules', error: error.message });
  }
};

// Get a single schedule by ID
const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.status(200).json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ message: 'Error fetching schedule', error: error.message });
  }
};

// Create a new schedule
const createSchedule = async (req, res) => {
  try {
    const {
      roomName,
      eventType,
      customEventType,
      eventName,
      faculty,
      department,
      date,
      startTime,
      duration,
      recurrence,
      recurrenceFrequency,
      priorityLevel,
      createdBy,
      email,
    } = req.body;

    const room = await LectureRoom.findOne({ roomName });
    if (!room) {
      return res.status(400).json({ message: `Room ${roomName} does not exist` });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    if (selectedDate < today) {
      return res.status(400).json({ message: 'Date cannot be in the past' });
    }

    const scheduleData = {
      roomName,
      eventType,
      customEventType: eventType === 'Other' ? customEventType : undefined,
      eventName,
      faculty,
      department,
      date: new Date(date),
      startTime,
      duration: parseInt(duration, 10),
      recurrence,
      recurrenceFrequency: recurrence === 'Yes' ? recurrenceFrequency : undefined,
      priorityLevel,
      createdBy,
      email,
    };

    const newSchedule = new Schedule(scheduleData);
    await newSchedule.save();
    res.status(201).json({ message: 'Schedule created successfully', schedule: newSchedule });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(400).json({ message: 'Error creating schedule', error: error.message });
  }
};

// Update a schedule
const updateSchedule = async (req, res) => {
  try {
    const {
      roomName,
      eventType,
      customEventType,
      eventName,
      faculty,
      department,
      date,
      startTime,
      duration,
      recurrence,
      recurrenceFrequency,
      priorityLevel,
      createdBy,
      email,
    } = req.body;

    const room = await LectureRoom.findOne({ roomName });
    if (!room) {
      return res.status(400).json({ message: `Room ${roomName} does not exist` });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    if (selectedDate < today) {
      return res.status(400).json({ message: 'Date cannot be in the past' });
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      {
        roomName,
        eventType,
        customEventType: eventType === 'Other' ? customEventType : undefined,
        eventName,
        faculty,
        department,
        date: new Date(date),
        startTime,
        duration: parseInt(duration, 10),
        recurrence,
        recurrenceFrequency: recurrence === 'Yes' ? recurrenceFrequency : undefined,
        priorityLevel,
        createdBy,
        email,
      },
      { new: true, runValidators: true }
    );

    if (!updatedSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.status(200).json({ message: 'Schedule updated successfully', schedule: updatedSchedule });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(400).json({ message: 'Error updating schedule', error: error.message });
  }
};

// Delete a schedule
const deleteSchedule = async (req, res) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!deletedSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ message: 'Error deleting schedule', error: error.message });
  }
};

module.exports = {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};