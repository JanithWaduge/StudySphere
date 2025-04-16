const Course = require('../models/coursemodel');

// View all courses
const getcourses1 = async (req, res) => {
  try {
    const allCourses = await Course.find();

    if (!allCourses || allCourses.length === 0) {
      return res.status(404).json({ message: "No courses found" });
    }

    res.status(200).json({ courses: allCourses });
  } catch (err) {
    console.error("Error retrieving courses:", err);
    res.status(500).json({ message: "Failed to fetch courses", error: err.message });
  }
};

module.exports = { getcourses1 };
