const mongoose = require('mongoose');

const ulbSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    districtId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    }

})

module.exports = Ulb = new mongoose.model('Ulb', ulbSchema);
