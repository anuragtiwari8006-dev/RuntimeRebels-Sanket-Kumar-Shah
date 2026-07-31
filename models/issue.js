const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'General'
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'],
    default: 'PENDING'
  },
  roomNumber: {
    type: String,
    default: ''
  },
  urgency: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'],
    default: 'MEDIUM'
  }
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);