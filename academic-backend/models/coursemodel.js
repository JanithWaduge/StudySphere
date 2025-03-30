const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
        code: String,
        name: String,
        credithours: String,
        department: String,
        assignedlecturer: String,
});

const Course = mongoose.model('Course',courseSchema);

module.exports = Course;