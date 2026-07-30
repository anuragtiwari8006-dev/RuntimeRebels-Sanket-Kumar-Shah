const VisitorPass = require('../models/VisitorPass'); // or '../models/visitorpass' depending on your filename
const SystemSettings = require('../models/SystemSettings'); // or '../models/SystemSetting'
const maskPhoneNumber = require('../utils/maskPhone'); // or '../utils/maskphone'

// 1. Resident: Request a Visitor Gate Pass (Defaults to PENDING now)
exports.createPass = async (req, res) => {
  try {
    const { visitorName, visitorPhone, relation, hoursValid } = req.body;
    
    const qrToken = `PASS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + (parseInt(hoursValid) || 12));

    const pass = new VisitorPass({
      resident: req.user.id,
      visitorName,
      visitorPhone,
      relation,
      validUntil,
      qrToken,
      status: 'PENDING' // 👈 NOW REQUIRES WARDEN APPROVAL FIRST
    });

    await pass.save();
    res.status(201).json({ message: 'Gate Pass requested! Awaiting Warden approval.', pass });
  } catch (err) {
    res.status(500).json({ message: 'Error generating pass', error: err.message });
  }
};

// 2. Warden: Get all PENDING passes requiring approval
exports.getPendingPasses = async (req, res) => {
  try {
    const passes = await VisitorPass.find({ status: 'PENDING' }).populate('resident', 'name roomNumber');
    res.json(passes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending passes', error: err.message });
  }
};

// 3. Warden: Approve or Reject a Pass
exports.updatePassStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const pass = await VisitorPass.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ message: `Pass ${status.toLowerCase()} successfully`, pass });
  } catch (err) {
    res.status(500).json({ message: 'Error updating pass status', error: err.message });
  }
};

// 4. Resident: Fetch active/history passes
exports.getResidentPasses = async (req, res) => {
  try {
    const passes = await VisitorPass.find({ resident: req.user.id }).sort({ createdAt: -1 });
    res.json(passes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching passes', error: err.message });
  }
};

// 5. Security Guard: Verify Pass (Rejects PENDING passes automatically!)
exports.verifyPass = async (req, res) => {
  try {
    const settings = await SystemSettings.findOne();
    if (settings && settings.isLockdownActive) {
      return res.status(403).json({ 
        allowed: false, 
        message: '🚨 GATE LOCKDOWN ACTIVE: All entry/exit passes suspended by Warden!' 
      });
    }

    const { qrToken } = req.body;
    const pass = await VisitorPass.findOne({ qrToken }).populate('resident', 'name roomNumber');

    if (!pass) {
      return res.status(404).json({ allowed: false, message: 'Invalid or Fraudulent QR Pass' });
    }

    // Block scanning if Warden hasn't approved yet!
    if (pass.status === 'PENDING') {
      return res.status(403).json({ allowed: false, message: 'Pass is still PENDING Warden approval!' });
    }

    if (new Date() > new Date(pass.validUntil)) {
      pass.status = 'REJECTED';
      await pass.save();
      return res.status(400).json({ allowed: false, message: 'Pass Expired' });
    }

    if (pass.status === 'APPROVED') {
      pass.status = 'CHECKED_IN';
      pass.entryTime = new Date();
      await pass.save();

      return res.json({
        allowed: true,
        action: 'CHECK_IN',
        message: 'Entry Approved! Visitor Checked In.',
        pass: {
          visitorName: pass.visitorName,
          visitorPhoneMasked: maskPhoneNumber(pass.visitorPhone),
          relation: pass.relation,
          residentName: pass.resident.name,
          roomNumber: pass.resident.roomNumber,
          status: pass.status
        }
      });
    } else if (pass.status === 'CHECKED_IN') {
      pass.status = 'CHECKED_OUT';
      pass.exitTime = new Date();
      await pass.save();

      return res.json({
        allowed: true,
        action: 'CHECK_OUT',
        message: 'Exit Approved! Visitor Checked Out.',
        pass: {
          visitorName: pass.visitorName,
          visitorPhoneMasked: maskPhoneNumber(pass.visitorPhone),
          relation: pass.relation,
          residentName: pass.resident.name,
          roomNumber: pass.resident.roomNumber,
          status: pass.status
        }
      });
    } else {
      return res.status(400).json({ 
        allowed: false, 
        message: `Pass cannot be used (${pass.status}).` 
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error processing pass scan', error: err.message });
  }
};

// 6. Warden: Toggle Emergency Gate Lockdown
exports.toggleLockdown = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({ isLockdownActive: false });
    }

    settings.isLockdownActive = !settings.isLockdownActive;
    settings.updatedBy = req.user.id;
    await settings.save();

    res.json({ 
      isLockdownActive: settings.isLockdownActive, 
      message: settings.isLockdownActive ? '🚨 Gate Lockdown Activated' : '✅ Lockdown Lifted' 
    });
  } catch (err) {
    res.status(500).json({ message: 'Error toggling lockdown', error: err.message });
  }
};

// 7. Public/Guard: Check current lockdown status
exports.getLockdownStatus = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    res.json({ isLockdownActive: settings ? settings.isLockdownActive : false });
  } catch (err) {
    res.json({ isLockdownActive: false });
  }
};