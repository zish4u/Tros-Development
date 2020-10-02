const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    }
})

module.exports = Work = new mongoose.model('Work', workSchema);
