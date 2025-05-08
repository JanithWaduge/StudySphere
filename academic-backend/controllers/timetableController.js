const Timetable = require('../models/Timetable');
const Enrollment = require('../models/enrollmenetModel'); // as named
const Lecturer = require('../models/user');
const Room = require('../models/LectureRoom');

const autoGenerateTimetables = async (req, res) => {
  try {
    const enrollments = await Enrollment.find();
    const lecturers = await Lecturer.find();
    const rooms = await Room.find();

    console.log("✅ Enrollments:", enrollments.length);
    console.log("✅ Lecturers:", lecturers.length);
    console.log("✅ Rooms:", rooms.length);

    if (lecturers.length === 0 || rooms.length === 0) {
      return res.status(400).json({ message: "Lecturer or room data missing" });
    }

    const timeSlots = ['09:00', '11:00', '13:00', '15:00'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const usedSlots = new Set();
    const generatedSchedules = [];

    let i = 0;

    for (let enr of enrollments) {
      const courseName = enr.courseName?.trim();
      if (!courseName) continue;

      const lecturer = lecturers[i % lecturers.length];
      const room = rooms[i % rooms.length];

      const date = days[i % days.length];
      const time = timeSlots[i % timeSlots.length];
      const slotKey = `${room.roomName}-${date}-${time}`;
      if (usedSlots.has(slotKey)) continue;

      usedSlots.add(slotKey);

      const newSchedule = new Timetable({
        roomName: room.roomName,
        eventType: 'Lecture',
        eventName: courseName.toLowerCase(), // Normalize
        code: courseCode, // ✅ added
        faculty: 'Auto-Generated',
        department: 'Default',
        date: new Date(),
        startTime: time,
        duration: 2,
        priorityLevel: 'Normal',
        createdBy: 'System',
        email: lecturer.email || 'noreply@system.com',
      });

      console.log(`✔️ Inserting: ${courseName} on ${date} at ${time}`);
      await newSchedule.save();
      generatedSchedules.push(newSchedule);

      i++;
    }

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


const generateTimetable = async (req, res) => {
  try {
    const enrollments = await Enrollment.find().populate('studentId courseId');
    const timetable = [];

    for (const enrollment of enrollments) {
      const { studentId, courseId } = enrollment;
      const lecturer = await Lecturer.findOne({ role: 'lecturer' });
      const room = await Room.findOne();

      const date = 'Monday';
      const timeSlot = '9:00AM - 10:00AM';

      timetable.push({
        studentId,
        courseId,
        lecturerId: lecturer._id,
        roomId: room._id,
        date,
        timeSlot,
      });
    }

    await Timetable.insertMany(timetable);
    res.status(200).json({ message: 'Timetable generated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  autoGenerateTimetables,
  generateTimetable
};
