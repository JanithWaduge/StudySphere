const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const LectureRoom = require('../models/LectureRoom');
const PDFDocument = require('pdfkit');

// ✅ Import controller functions
const {
  autoGenerateTimetables,
  generateTimetable,
} = require('../controllers/timetableController');

// 🔹 Auto-generate timetable
router.post('/generate-auto', autoGenerateTimetables);

// 🔹 Manual generation
router.post('/generate-manual', generateTimetable);

// 🔹 Get all timetable entries
router.get('/', async (req, res) => {
  try {
    const timetables = await Timetable.find();
    res.status(200).json(timetables);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timetable', error: error.message });
  }
});

// 🔹 Get timetable by ID
router.get('/:id', async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) return res.status(404).json({ message: 'Timetable not found' });
    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timetable', error: error.message });
  }
});

// 🔹 Create manual timetable entry
router.post('/', async (req, res) => {
  try {
    const {
      roomName, eventType, customEventType, eventName, faculty,
      department, date, startTime, duration, recurrence,
      recurrenceFrequency, priorityLevel, createdBy, email,
    } = req.body;

    const room = await LectureRoom.findOne({ roomName });
    if (!room) return res.status(400).json({ message: `Room ${roomName} does not exist` });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    if (selectedDate < today) return res.status(400).json({ message: 'Date cannot be in the past' });

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

    const newSchedule = new Timetable(scheduleData);
    await newSchedule.save();
    res.status(201).json({ message: 'Timetable created successfully', schedule: newSchedule });
  } catch (error) {
    res.status(400).json({ message: 'Error creating timetable', error: error.message });
  }
});

// 🔹 Update timetable
router.put('/:id', async (req, res) => {
  try {
    const {
      roomName, eventType, customEventType, eventName, faculty,
      department, date, startTime, duration, recurrence,
      recurrenceFrequency, priorityLevel, createdBy, email,
    } = req.body;

    const room = await LectureRoom.findOne({ roomName });
    if (!room) return res.status(400).json({ message: `Room ${roomName} does not exist` });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    if (selectedDate < today) return res.status(400).json({ message: 'Date cannot be in the past' });

    const updatedSchedule = await Timetable.findByIdAndUpdate(
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

    if (!updatedSchedule) return res.status(404).json({ message: 'Timetable not found' });

    res.status(200).json({ message: 'Timetable updated successfully', schedule: updatedSchedule });
  } catch (error) {
    res.status(400).json({ message: 'Error updating timetable', error: error.message });
  }
});

// 🔹 Delete timetable
router.delete('/:id', async (req, res) => {
  try {
    const deletedSchedule = await Timetable.findByIdAndDelete(req.params.id);
    if (!deletedSchedule) return res.status(404).json({ message: 'Timetable not found' });
    res.status(200).json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting timetable', error: error.message });
  }
});

module.exports = router;
