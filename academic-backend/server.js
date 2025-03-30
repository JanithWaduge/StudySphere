
const port = 5000;
const host = 'localhost';
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const router = require('./routes/courserouter');
const router2 = require('./routes/lecturerouter');
const router3 = require('./routes/studentRoute');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');


app.use(cors());
app.use(express.json());

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
app.use('/api',router3);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

