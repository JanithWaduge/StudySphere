const studentModel = require('../models/student');


// Create a new student
const registerStudent = async (req, res) => {
    try {
        const { name, email, phone, address, username, password } = req.body;

        // input field validation
        if (!name || !email || !phone || !address || !username || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newStudent = new studentModel({            
            name, 
            email, 
            phone, 
            address, 
            username,
            password: hashedPassword,
            registerDate: new Date()
        });

        const savedStudent = await newStudent.save();

        res.status(201).json({ message: "Student registered successfully", savedStudent });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred while registering the student.", error: err.message });
    }
}


// get all students
const viewAllStudents = async (req, res) => {

    try {
        const allStudnets = await studentModel.find();

        if (!allStudnets) {
            return res.status(404).json({ message: "No students are available." });
        }

        res.status(200).json({ message: "Students :", allStudnets });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error when fetching students..", error: err.message });
    }
}


// get one student
const viewOneStudent = async (req, res) => {
    try {
        const studentId = req.params.id;

        const student = await studentModel.find({ studentId });

        return res.status(200).json({ message: "Student Details : ", student });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Unable to get studnet by Id", error: err.message });
    }
}


// update student
const updateStudent = async (req, res) => {

    try {
        const { name, email, phone, address } = req.body;

        // input field validation
        if (!name || !email || !phone || !address) {
            return res.status(400).json({ message: "Please enter all fields" });
        }        

        const studentId = req.params.id;

        const updateFields = { name, email, phone, address};

        const updatedStudent = await studentModel.findOneAndUpdate(
            { studentId },  
            updateFields,        
            { new: true }        
        );
      
        return res.status(200).json({ message: "Studnet details updated", updatedStudent });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Unalbe to update the student" })
    }
}

// update student
const updateStudentPassword = async (req, res) => {

    try {
        const {password } = req.body;
        
        const studentId = req.params.id;

        if (password) {
            updateFields.password = await bcrypt.hash(password, 10);
        }

        const updatedStudent = await studentModel.findOneAndUpdate(
            { studentId },  
            updateFields,        
            { new: true }        
        );
      
        return res.status(200).json({ message: "Password updated", updatedStudent });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Unalbe to update the password" })
    }
}

 
// delete student
const deleteStudent = async (req, res) => {

    try {
        const studentId = req.params.id;

        const deletedStudent = await studentModel.findOneAndDelete({ studentId });

        res.status(200).json({ message: "Student deleted..", deletedStudent });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error when deleting student..", erro: err.message });
    }
}


// login student
const loginStudent = async (req, res) => {

    try {
        const { username, password } = req.body;

        // input field validation
        if (!username || !password) {
            return res.status(400).json({ message: "Please enter username and password" });
        }

        const student = await studentModel.findOne({ username });

        if (!student) {
            return res.status(404).json({ message: "Username not found.." });
        }

        const isPasswordValid = await bcrypt.compare(password, student.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        return res.status(200).json({ message: "Login successful" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { registerStudent, viewAllStudents, viewOneStudent, updateStudent, updateStudentPassword, deleteStudent, loginStudent };