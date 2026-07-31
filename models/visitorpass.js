const mongoose = require('mongoose');

const visitorPassSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  outDate: {
    type: String,
    required: [true, 'Out date is required']
  },
  inDate: {
    type: String,
    required: [true, 'Expected return date is required']
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CHECKED_OUT', 'CHECKED_IN'],
    default: 'PENDING'
  },
  // Set default generator + sparse: true to prevent MongoDB index collisions (E11000 error)
  qrToken: {
    type: String,
    default: () => Math.random().toString(36).substring(2) + Date.now().toString(36),
    sparse: true
  },
  securityCheckedOutAt: {
    type: Date
  },
  securityCheckedInAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('VisitorPass', visitorPassSchema);