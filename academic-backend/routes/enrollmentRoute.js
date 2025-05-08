const { createEnrollment, getEnrollmentsByStudent, getStudentCountByCourse} = require('../controllers/enrollmentController');

const express = require('express');
const router = express.Router();

router.post('/create', createEnrollment);

router.get('/student-enrollments/:studentId', getEnrollmentsByStudent);

router.get("/student-count/:code", getStudentCountByCourse);

module.exports = router;