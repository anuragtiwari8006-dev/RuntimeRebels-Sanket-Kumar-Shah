const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomNumber: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['PLUMBING', 'ELECTRICAL', 'INTERNET', 'CLEANING', 'OTHER'], 
      required: true 
    },
    priority: { 
      type: String, 
      enum: ['EMERGENCY', 'HIGH', 'MEDIUM', 'LOW'], 
      default: 'MEDIUM' 
    },
    description: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'], 
      default: 'OPEN' 
    },
    slaHours: { type: Number, default: 24 }, // Emergency: 4h, High: 12h, Medium: 24h
    isEscalated: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Issue', issueSchema);