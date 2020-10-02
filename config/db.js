require('dotenv').config()
const mongoose = require('mongoose');
const { success, error } = require('consola');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.dbConnect, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });
        success({ message: `Successfully connected to Database`, badge: true });
    } catch (err) {
        error({ message: err.message, badge: true });
        process.exit(1);
    }
}

module.exports = connectDB;