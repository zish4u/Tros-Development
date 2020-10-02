const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    from: {
        type: Date
    },
    to: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = Holiday = new mongoose.model('Holiday', holidaySchema);