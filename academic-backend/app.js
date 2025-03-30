const express = require('express');
const cors = require('cors');
const app = express();
const controller = require('./controllers/coursecontroller');
const controller2 = require('./controllers/lecturecontroller');
const controller3 = require('./controllers/studentController');

app.use(cors());

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


module.exports = app;