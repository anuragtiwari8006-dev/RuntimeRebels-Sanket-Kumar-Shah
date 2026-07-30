const mongoose = require('mongoose');

const visitorPassSchema = new mongoose.Schema({
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visitorName: { type: String, required: true },
  visitorPhone: { type: String, required: true },
  relation: { type: String, required: true },
  qrToken: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'CHECKED_IN', 'CHECKED_OUT', 'REJECTED'], 
    default: 'APPROVED' 
  },
  validUntil: { type: Date, required: true },
  entryTime: { type: Date },
  exitTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('VisitorPass', visitorPassSchema);