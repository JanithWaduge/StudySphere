const express = require('express');
const router = express.Router();
const controller = require('../controllers/lecturecontroller.js');

router.get('/lecturers',controller.getlecturers);
router.post('/createlecturer',controller.addLecturer);
router.put('/updatelecturer',controller.updateLecturer);
router.delete('/deletelecturer',controller.deleteLecturer);

module.exports = router;