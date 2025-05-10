const express = require('express');
const router = express.Router();
const {
  getAllLectureRooms,
  getLectureRoomById,
  createLectureRoom,
  updateLectureRoom,
  deleteLectureRoom,
  checkRoomName,
  searchLectureRooms,
  generateReport,
} = require('../controllers/lectureRoomController');

// Get all lecture rooms
router.get('/', getAllLectureRooms);

// Get a single lecture room by ID
router.get('/:id', getLectureRoomById);

// Add a new lecture room
router.post('/', createLectureRoom);

// Update a lecture room
router.put('/:id', updateLectureRoom);

// Delete a lecture room
router.delete('/:id', deleteLectureRoom);

// Check if a room name exists
router.get('/check-room-name', checkRoomName);

// Search lecture rooms
router.get('/search', searchLectureRooms);

// Generate report
router.get('/report', generateReport);

module.exports = router;