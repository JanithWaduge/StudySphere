const { getcourses1} = require('../controllers/coursecon1');

const express = require('express');
const router = express.Router();


router.get('/all', getcourses1);

module.exports = router;