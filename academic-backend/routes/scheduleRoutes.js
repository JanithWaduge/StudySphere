const express = require('express');
const router = express.Router();
const {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} = require('../controllers/scheduleController');

// Get all schedules
router.get('/', getAllSchedules);

// Get a single schedule by ID
router.get('/:id', getScheduleById);

// Create a new schedule
router.post('/', createSchedule);

// Update a schedule
router.put('/:id', updateSchedule);

// Delete a schedule
router.delete('/:id', deleteSchedule);

module.exports = router;