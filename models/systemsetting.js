const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    isLockdownActive: { type: Boolean, default: false },
    lockdownReason: { type: String, default: 'Emergency Gate Lockdown Initiated by Warden' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);