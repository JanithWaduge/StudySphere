const Timetable = require('../models/Timetable');
const Enrollment = require('../models/enrollmenetModel'); // Correct import path
const Lecturer = require('../models/user');
const Room = require('../models/LectureRoom');

// Auto-generate timetables with conflict handling
const autoGenerateTimetables = async (req, res) => {
  try {
    // Fetch enrollments, lecturers, and rooms from the database
    const enrollments = await Enrollment.find();
    const lecturers = await Lecturer.find();
    const rooms = await Room.find();

    console.log("✅ Enrollments:", enrollments.length);
    console.log("✅ Lecturers:", lecturers.length);
    console.log("✅ Rooms:", rooms.length);

    // Return error if there are no lecturers or rooms
    if (lecturers.length === 0 || rooms.length === 0) {
      return res.status(400).json({ message: "Lecturer or room data missing" });
    }

    // Define possible time slots and days
    const timeSlots = ['09:00', '11:00', '13:00', '15:00'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const generatedSchedules = [];

    let i = 0;

    // Loop through all enrollments to generate timetables
    for (let enr of enrollments) {
      const courseName = enr.courseName?.trim();
      if (!courseName) continue;  // Skip if course name is not available

      const lecturer = lecturers[i % lecturers.length];  // Use modulo to cycle through lecturers
      const room = rooms[i % rooms.length];  // Use modulo to cycle through rooms

      const date = days[i % days.length];  // Use modulo to cycle through days
      const time = timeSlots[i % timeSlots.length];  // Use modulo to cycle through time slots
      const slotKey = `${room.roomName}-${date}-${time}`;  // Unique key for room-date-time

      // Check if a timetable entry with the same room, day, and time already exists
      const existingSchedule = await Timetable.findOne({ roomName: room.roomName, date: date, startTime: time });
      if (existingSchedule) {
        console.log(`❌ Slot conflict detected for ${courseName} on ${date} at ${time}`);
        continue;  // Skip if a schedule already exists for this slot
      }

      // Create a new timetable entry
      const newSchedule = new Timetable({
        roomName: room.roomName,
        eventType: 'Lecture',
        eventName: courseName.toLowerCase(),
        code: enr.courseCode,  // Assuming 'courseCode' exists in the enrollment model
        faculty: 'Auto-Generated',
        department: 'Default',
        date: new Date(),
        startTime: time,
        duration: 2,  // Assuming 2 hours duration
        priorityLevel: 'Normal',
        createdBy: 'System',
        email: lecturer.email || 'noreply@system.com',
      });

      console.log(`✔️ Inserting: ${courseName} on ${date} at ${time}`);
      await newSchedule.save();  // Save the new schedule to the database
      generatedSchedules.push(newSchedule);  // Add to the generated schedules list

      i++;
    }

    // Send response after generating the timetables
    res.status(201).json({
      message: 'Auto timetable generation complete',
      schedules: generatedSchedules,
    });

  } catch (error) {
    console.error('Auto-generation failed:', error);
    res.status(500).json({
      message: 'Failed to auto-generate timetable',
      error: error.message,
    });
  }
};

// Generate timetable manually
const generateTimetable = async (req, res) => {
  try {
    const enrollments = await Enrollment.find().populate('studentId courseId');
    const timetable = [];

    // Loop through enrollments and create timetable entries
    for (const enrollment of enrollments) {
      const { studentId, courseId } = enrollment;
      const lecturer = await Lecturer.findOne({ role: 'lecturer' });
      const room = await Room.findOne();

      const date = 'Monday';  // Static date for simplicity, could be dynamic
      const timeSlot = '9:00AM - 10:00AM';  // Static time slot for simplicity

      timetable.push({
        studentId,
        courseId,
        lecturerId: lecturer._id,
        roomId: room._id,
        date,
        timeSlot,
      });
    }

    // Insert multiple timetable entries at once
    await Timetable.insertMany(timetable);
    res.status(200).json({ message: 'Timetable generated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  autoGenerateTimetables,
  generateTimetable,
};
