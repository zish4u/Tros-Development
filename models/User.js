const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: true,
    },
    accountNo: {
      type: String
    },
    ifsc: {
      type: String
    },
    bankName: {
      type: String
    },
    branch: {
      type: String
    },
    bankAddress: {
      type: String
    },
    accountHolder: {
      type: String
    },
    profileImage: {
      type: String,
    },
    assignedUlb: [{
      type: String
    }],
    role: {
      type: String,
      required: true,
      enum: ['deo', 'admin', 'manager', 'hr'],
    },
    dob: {
      type: Date,
    },
    phone: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
    },
    address: {
      type: String,
    },
    qualification: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    banned: {
      type: Boolean,
      default: false
    },
    isAuthenticated: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = User = new mongoose.model('User', userSchema);
