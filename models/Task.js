const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({


    titleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Work'
    },
    title: {
        type: String,
        required: true
    },
    ulbId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ulb'
    },
    ulb: {
        type: String,
        required: true
    },
    taskDate: {
        type: Date,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    file: {
        type: String,
    },
    status: {
        type: String,
        required: true
    },
    submit: {
        type: Boolean,
        default: false
    },
    cause: {
        type: String
    },
    reportingStaff: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    remark: {
        type: String
    },
    manager: {
        type: String
    },
    managerId: {
        type: String
    }
}, { timestamps: true })

module.exports = Task = mongoose.model('Task', taskSchema); 