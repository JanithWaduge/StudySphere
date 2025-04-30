
const port = 5000;
const host = 'localhost';
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const router = require('./routes/courserouter');
const router2 = require('./routes/lecturerouter');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const router5 = require('./routes/courserout1');
const lectureRoomRoutes = require('./routes/lectureRoomRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes'); 
const reportRoutes = require('./routes/reportRoutes'); 
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const studentRoutes = require('./routes/studentRoute');
const examRoutes = require('./routes/examroute');
const enrollmentRoutes = require('./routes/enrollmentRoute');
const courseRoutes = require('./routes/courserouter');

// Load environment variables
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const uri = 'mongodb+srv://janith:janith1428@cluster0.puzld.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const connect = async () => {
    try{
        await mongoose.connect(uri);
        console.log('Connected to mongodb');
    }
    catch(error){
        console.log('MongoDB Error',error);
    }
};

connect();

const server = app.listen(port,host, () => {
    console.log(`Node server is listening to ${server.address().port}`)
}) ;

app.use('/api',router);
app.use('/api',router2);
app.use('/api',router5);

app.use('/student/', studentRoutes);
app.use('/exam/', examRoutes);
app.use('/enrollment/', enrollmentRoutes);
app.use('/course/', courseRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lecture-rooms', lectureRoomRoutes);
app.use('/api/schedules', scheduleRoutes); 
app.use('/api/reports', reportRoutes); 


module.exports = app;