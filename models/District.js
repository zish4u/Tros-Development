const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    }
})

module.exports = District = new mongoose.model('District', districtSchema);
