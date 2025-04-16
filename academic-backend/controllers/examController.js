const examModel = require('../models/examModel');
const Enrollment = require('../models/enrollmenetModel'); // Import enrollment model

// Create a new exam
const createExam = async (req, res) => {
  try {
    const { code, examName, examDate, examDuration } = req.body;

    // Validate input
    if (!code || !examName || !examDate || !examDuration) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Get the student count for the given course code
    const studentCount = await Enrollment.countDocuments({ code });

    // Create new exam document
    const newExam = new examModel({
      code,
      examName,
      examDate,
      examDuration,
      studentCount,
    });

    const savedExam = await newExam.save();

    res.status(201).json({ message: "Exam created successfully", savedExam });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred while creating the exam.", error: err.message });
  }
};

// View all exams
const viewAllExams = async (req, res) => {
  try {
    const allExams = await examModel.find();

    if (!allExams || allExams.length === 0) {
      return res.status(404).json({ message: "No exams are available." });
    }

    res.status(200).json({ message: "Exams fetched successfully", allExams });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching exams", error: err.message });
  }
};

// View one exam
const viewOneExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await examModel.findById(examId );

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({ message: "Exam details", exam });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching exam", error: err.message });
  }
};


// view exams for one student
const viewAllExamsForStudent = async (req, res) => {
  try {
    const studentId = req.params.id; 

    const enrollments = await Enrollment.find({ studentId });
    
    if (!enrollments || enrollments.length === 0) {
      return res.status(404).json({ message: "No enrollments found for this student." });
    }

    const courseCodes = [...new Set(enrollments.map(enrollment => enrollment.code))];

    // Find exams that match any of these course codes
    const studentExams = await examModel.find({ code: { $in: courseCodes } });

    if (!studentExams || studentExams.length === 0) {
      return res.status(404).json({ message: "No exams available for your enrolled courses." });
    }

    res.status(200).json({ 
      message: "Exams fetched successfully", 
      exams: studentExams 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: "Error fetching exams", 
      error: err.message 
    });
  }
};


// Reschedule exam
const rescheduleExam = (req, res, next) => {
  const { _id, code, examName, examDate, examDuration } = req.body;

  examModel.updateOne(
    { _id: _id },
    {
      $set: { code, examName, examDate, examDuration }
    }
  )
  .then(response => {
    if (response.matchedCount === 0) {
      res.status(404).json({ message: "Exam not found" });
    } else {
      res.status(200).json({ message: "Exam rescheduled successfully", response });
    }
  })
  .catch(error => {
    console.error("Error rescheduling exam:", error);
    res.status(500).json({ message: "Error rescheduling exam", error: error.message });
  });
};



// Delete exam
const deleteExam = (req, res, next) => {
  const examId = req.body._id; // or req.body.id, depending on your frontend

  examModel.deleteOne({ _id: examId })
    .then(response => {
      if (response.deletedCount === 0) {
        res.status(404).json({ message: "Exam not found" });
      } else {
        res.status(200).json({ message: "Exam deleted successfully", response });
      }
    })
    .catch(error => {
      console.error("Error deleting exam:", error);
      res.status(500).json({ message: "Error deleting exam", error: error.message });
    });
};




module.exports = {
  createExam,
  viewAllExams,
  viewOneExam,
  viewAllExamsForStudent,
  rescheduleExam,
  deleteExam
};
