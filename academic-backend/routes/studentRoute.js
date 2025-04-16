const { registerStudent, getAllStudents, viewOneStudent, updateStudent,updateStudentPassword, deleteStudent, loginStudent } = require('../controllers/studentController');
const express = require('express');

const router = express.Router();

router.post('/register', registerStudent);

router.get('/students', getAllStudents);

router.get('/view/:id', viewOneStudent);

router.put('/update/:id', updateStudent);

router.put('/change-password/:id', updateStudentPassword);

router.delete('/delete/:id', deleteStudent);

router.post('/login', loginStudent);

module.exports = router;