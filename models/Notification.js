const mongoose = require('mongoose');

const notifSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    desc: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

}, {
    timestamps: true
})

module.exports = Notification = new mongoose.model('Notification', notifSchema);