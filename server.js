const express = require('express');
const app = express();
const connectDB = require('./config/db');
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const path = require('path');
const {
    success,
    error
} = require('consola');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));
app.use(express.json({
    extended: false
}));

app.use(cors({
    origin: 'http://localhost:4200'
}));

connectDB();

app.get('/', (req, res) => {
    res.send('API is running.');
});

app.use('/api/users', require('./Routes/api/user'));
app.use('/api/notifications', require('./Routes/api/notification'));
app.use('/api/todos', require('./Routes/api/todo'));
app.use('/api/tasks', require('./Routes/api/task'));
app.use('/api/main', require('./Routes/api/main'));
app.use('/api/reports', require('./Routes/api/report'));
app.use('/api/attendances', require('./Routes/api/attendance'));
app.use('/api/leave', require('./Routes/api/leave'));
app.use('/api/holiday', require('./Routes/api/holiday'));


app.listen(PORT, async (req, res) => {
    try {
        success({
            message: "CORS-enabled web server listening on port " + PORT,
            badge: true
        });
    } catch (err) {
        error({
            message: "Unable to connect to Database",
            badge: true
        });
        connectDB();
    }

});