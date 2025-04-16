const Course = require('../models/coursemodel');
const Lecturer = require('../models/lecturemodel'); // ✅ Add this line

const getcourses = (req , res , next) => {
    Course.find()
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ message: error });
        });
};

const addCourse = async (req, res, next) => {
    try {
        let { code, name, credithours, department, assignedlecturer } = req.body;

        // ✅ Auto-assign logic
        if (!assignedlecturer || assignedlecturer === "") {
            const availableLecturer = await Lecturer.findOne({
                department: department,
                availabilityStatus: "Available"
            });

            if (availableLecturer) {
                assignedlecturer = availableLecturer.name;

                // ✅ Optional: check course count and update availability if needed
                const assignedCount = await Course.countDocuments({ assignedlecturer });
                if (assignedCount + 1 >= 3) {
                    availableLecturer.availabilityStatus = "Not Available";
                    await availableLecturer.save();
                }
            } else {
                return res.status(400).json({ message: "No available lecturer found in this department." });
            }
        }

        const course = new Course({
            code,
            name,
            credithours,
            department,
            assignedlecturer,
        });

        const savedCourse = await course.save();
        res.status(201).json({ message: "Course added successfully", course: savedCourse });

    } catch (error) {
        console.error("Add Course Error:", error);
        res.status(500).json({ error: "Server error during course creation" });
    }
};




const updateCourse = (req, res , next) => {
    const {code , name , credithours , department , assignedlecturer } = req.body;
    Course.updateOne(
      { code: code },  // Find course by code
        { 
            $set: { 
                code: code,
                name: name, 
                credithours: credithours, 
                department: department, 
                assignedlecturer: assignedlecturer 
            }
        }
    )
    
    .then(response => {
        res.json({response})
      })
      .catch(error => {
        res.json({ error })
      });
}

const deleteCourse = (req ,res ,next) => {
    const code = req.body.code;
    Course.deleteOne({code:code})
    .then(response => {
        res.json({response})
      })
      .catch(error => {
        res.json({ error })
      });
}

exports.getcourses = getcourses;
exports.addCourse = addCourse;
exports.updateCourse = updateCourse;
exports.deleteCourse = deleteCourse;