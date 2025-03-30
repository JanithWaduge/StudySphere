const Lecturer = require('../models/lecturemodel');
const Course = require('../models/coursemodel');

// Get lecturers
const getlecturers = (req, res, next) => {
    Lecturer.find()
        .then(response => res.json({ response }))
        .catch(error => res.status(500).json({ message: error.message }));
};

// Add lecturer
const addLecturer = (req, res, next) => {
    const lecturer = new Lecturer({
        id: req.body.id,
        name: req.body.name,
        department: req.body.department,
        assignedCourses: req.body.assignedCourses,
        availabilityStatus: req.body.availabilityStatus,
        email: req.body.email,
    });

    lecturer.save()
        .then(response => res.json({ response }))
        .catch(error => res.status(500).json({ error: error.message }));
};

// Update lecturer
const updateLecturer = (req, res, next) => {
    const { id, name, department, assignedCourses, availabilityStatus, email } = req.body;

    Lecturer.updateOne(
        { id },
        {
            $set: {
                name,
                department,
                assignedCourses,
                availabilityStatus,
                email,
            }
        }
    )
        .then(response => res.json({ response }))
        .catch(error => res.status(500).json({ error: error.message }));
};

// Delete lecturer and update courses
const deleteLecturer = async (req, res) => {
    const { id } = req.body;

    try {
        const lecturer = await Lecturer.findOneAndDelete({ id });

        if (!lecturer) {
            return res.status(404).json({ message: "Lecturer not found" });
        }

        await Course.updateMany(
            { assignedlecturer: lecturer.name },  // Use lecturer.name instead of lecturer.id
            { $set: { assignedlecturer: "Lecturer Unavailable" } }
        );

        res.status(200).json({ message: "Lecturer deleted and courses updated." });
    } catch (error) {
        console.error("Error deleting lecturer:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getlecturers = getlecturers;
exports.addLecturer = addLecturer;
exports.updateLecturer = updateLecturer;
exports.deleteLecturer = deleteLecturer;
