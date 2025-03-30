const express = require('express');
const router = express.Router();
const controller = require('../controllers/coursecontroller');

router.get('/courses',controller.getcourses);
router.post('/createcourse',controller.addCourse);
router.put('/updatecourse',controller.updateCourse);
router.delete('/deletecourse',controller.deleteCourse);

module.exports = router;