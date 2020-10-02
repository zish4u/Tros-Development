const mongoose = require('mongoose');


const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "No name specified!"]
    },
    desc: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
module.exports = Todo = new mongoose.model("Todo", todoSchema);