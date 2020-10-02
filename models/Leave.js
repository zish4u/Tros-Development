const mongoose = require('mongoose');


const leaveSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    user: {
        type: String
    },
    from: {
        type: Date,
        required: [true, "FROM_IS_REQUIRED"]
    },
    to: {
        type: Date,
        required: [true, "TO_IS_REQUIRED"]
    },
    reason: {
        type: String,
        required: [true, "REASON_IS_REQUIRED"]
    },
    holidayTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Holiday'
    },
    holidayType: {
        type: String,
        required: true
    },
    approved: {
        type: Boolean
    },
    approvedBy: {
        type: String
    },
    approvedByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = Leave = new mongoose.model('Leave', leaveSchema);