const express = require('express');
const cors = require('cors');

const controller = require('./controllers/coursecontroller');
const controller2 = require('./controllers/lecturecontroller');
const controller3 = require('./controllers/studentController');
const controller4 = require('./controllers/examController');
const controller5 = require('./controllers/coursecon1');
const router = require('./routes/lectureRoomRoutes');
const timetableRoutes = require('./routes/timetableRoutes');

app.use(cors());

app.use('/api/timetable', timetableRoutes);

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(express.json());

app.get('/courses', (req, res) => {
    controller.getcourses(req, res, next => {
        res.send();
    });
});

app.post('/createcourse',(req,res) => {
    controller.addCourse(req.body,(callack)  => {
        res.send();
     });
});

app.put('/updatecourse',(req,res) => {
    controller.updateCourse(req.body,(callack)  => {
        res.send(callack);
     });
});

app.delete('/deletecourse',(req,res) => {
    controller.deleteCourse(req.body,(callack)  => {
        res.send(callack);
     });
});

app.get('/lecturers', (req, res) => {
    controller2.getlecturers(req, res, next => {
        res.send();
    });
});

app.post('/createlecturer',(req,res) => {
    controller2.addLecturer(req.body,(callack)  => {
        res.send();
     });
});

app.put('/updatelecturer',(req,res) => {    
    controller2.updateLecturer(req.body,(callack)  => {
        res.send(callack);
     });
});

app.delete('/deletelecturer',(req,res) => {
    controller2.deleteLecturer(req.body,(callack)  => {
        res.send(callack);
     });
});

app.get('/students', (req, res) => {
    controller3.viewAllStudents(req, res, next => {
        res.send();
    });
});

app.post('/createExam',(req,res) => {
    controller4.createExam(req.body,(callack)  => {
        res.send();
     });
});

app.get('/view-all', (req, res) => {
    controller4.viewAllExams(req, res, next => {
        res.send();
    });
});

app.get('/view/:id', (req, res) => {
    controller4.viewOneExam(req, res, next => {
        res.send();
    });
});

app.get('/student-exams/:id', (req, res) => {
    controller4.viewAllExamsForStudent(req, res, next => {
        res.send();
    });
});

app.put('/update/:id', (req, res) => {
    controller4.rescheduleExam(req, res, next => {
        res.send();
    });
});

app.delete('/delete', (req, res) => {    
    controller4.deleteExam(req, res, next => {
        res.send();
    });
});

app.get('/all', (req, res) => {
    controller5.getcourses1(req, res, next => {
        res.send();
    });
});

app.get('/lecture-rooms', (req, res) => {
    controller5.getLectureRooms(req, res, next => {        
        res.send();        
    });
});



// 404 - Not Found Middleware
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("🔥 Server Error: ", err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});




module.exports = app;