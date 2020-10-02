const mongoose = require('mongoose');


const attendanceSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    user: {
        type: String,
        required: true
    },
    present: {
        type: Boolean,
        required: true
    },
    onLeave: {
        type: Boolean,
        default: false
    },
    approved: {
        type: Boolean,
        default: false
    },
    cause: {
        type: String           //rejection cause by manager
    },
    approvedBy: {
        type: String
    },
    date: {
        type: Date,
        default: (new Date).setHours(00, 00, 00)
    }

}, {
    timestamps: true
});

module.exports = Attendance = new mongoose.model('Attendance', attendanceSchema);
