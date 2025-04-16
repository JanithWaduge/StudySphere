const { createExam, viewAllExams, viewOneExam, viewAllExamsForStudent, rescheduleExam, deleteExam } = require('../controllers/examController');

const express = require('express');
const router = express.Router();

router.post('/create', createExam);

router.get('/view-all', viewAllExams);

router.get('/view/:id', viewOneExam);

router.get('/student-exams/:id', viewAllExamsForStudent);

router.put('/update/:id', rescheduleExam); // ✅ expects :id from URL

router.post('/delete', deleteExam); // ✅ Use POST since you're sending body


module.exports = router;