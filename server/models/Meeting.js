// server/models/Meeting.js
const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  attendeeName: {
    type: String,
    required: true
  },
  representorName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agenda: {
    type: String,
    required: true
  },
 status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Meeting', meetingSchema);