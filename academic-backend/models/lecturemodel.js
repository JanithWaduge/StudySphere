const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lecturerSchema = new Schema({
   
    id: String,
    name: String,
    department: String,
    assignedCourses: String,
    availabilityStatus: String,
    email: String,
});

const Lecturer = mongoose.model('Lecturer',lecturerSchema);

module.exports = Lecturer;