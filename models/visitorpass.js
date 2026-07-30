const mongoose = require('mongoose');

const visitorPassSchema = new mongoose.Schema(
  {
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    visitorName: { type: String, required: true },
    visitorPhone: { type: String, required: true },
    relation: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CHECKED_IN', 'CHECKED_OUT'], 
      default: 'PENDING' 
    },
    validUntil: { type: Date, required: true },
    qrToken: { type: String, required: true, unique: true },
    entryTime: { type: Date, default: null },
    exitTime: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('VisitorPass', visitorPassSchema);