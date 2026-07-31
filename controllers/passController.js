const VisitorPass = require('../models/VisitorPass');

// 1. Resident: Create Gate Pass Request
async function createGatePass(req, res) {
  try {
    const { reason, destination, outDate, inDate } = req.body;
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ message: 'User identity missing from token.' });
    }

    if (!reason || !destination || !outDate || !inDate) {
      return res.status(400).json({ message: 'All fields (destination, reason, outDate, inDate) are required.' });
    }

    const pass = new VisitorPass({
      student: studentId,
      reason,
      destination,
      outDate,
      inDate
    });

    await pass.save();
    return res.status(201).json({ message: 'Gate Pass requested successfully!', pass });
  } catch (error) {
    console.error('Create Pass Error:', error);
    return res.status(500).json({ message: 'Failed to request Gate Pass.', error: error.message });
  }
}

// 2. Resident: Get My Gate Passes
async function getMyGatePasses(req, res) {
  try {
    const studentId = req.user?.id;
    const passes = await VisitorPass.find({ student: studentId }).sort({ createdAt: -1 });
    return res.status(200).json(passes);
  } catch (error) {
    console.error('Get My Passes Error:', error);
    return res.status(500).json({ message: 'Failed to fetch gate passes.', error: error.message });
  }
}

// 3. Warden: Get All Gate Passes
async function getAllGatePasses(req, res) {
  try {
    const passes = await VisitorPass.find()
      .populate('student', 'name email roomNumber')
      .sort({ createdAt: -1 });
    return res.status(200).json(passes);
  } catch (error) {
    console.error('Get All Passes Error:', error);
    return res.status(500).json({ message: 'Failed to fetch gate passes.', error: error.message });
  }
}

// 4. Warden: Approve or Reject Pass
async function updatePassStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status action.' });
    }

    const pass = await VisitorPass.findByIdAndUpdate(id, { status }, { new: true });
    if (!pass) return res.status(404).json({ message: 'Gate pass not found.' });

    return res.status(200).json({ message: `Gate pass ${status.toLowerCase()}!`, pass });
  } catch (error) {
    console.error('Update Pass Status Error:', error);
    return res.status(500).json({ message: 'Failed to update pass.', error: error.message });
  }
}

// 5. Guard: Get Active Approved/Checked-Out Passes
async function getGuardPasses(req, res) {
  try {
    const passes = await VisitorPass.find({
      status: { $in: ['APPROVED', 'CHECKED_OUT'] }
    })
    .populate('student', 'name email roomNumber')
    .sort({ createdAt: -1 });

    return res.status(200).json(passes);
  } catch (error) {
    console.error('Get Guard Passes Error:', error);
    return res.status(500).json({ message: 'Failed to fetch guard passes.', error: error.message });
  }
}

// 6. Guard: Mark Exit or Entry
async function markCheckOutIn(req, res) {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const updateData = {};
    if (action === 'CHECK_OUT') {
      updateData.status = 'CHECKED_OUT';
      updateData.securityCheckedOutAt = new Date();
    } else if (action === 'CHECK_IN') {
      updateData.status = 'CHECKED_IN';
      updateData.securityCheckedInAt = new Date();
    } else {
      return res.status(400).json({ message: 'Invalid security action.' });
    }

    const pass = await VisitorPass.findByIdAndUpdate(id, updateData, { new: true });
    if (!pass) return res.status(404).json({ message: 'Gate pass not found.' });

    return res.status(200).json({ message: `Status updated successfully!`, pass });
  } catch (error) {
    console.error('Security Action Error:', error);
    return res.status(500).json({ message: 'Failed to update pass status.', error: error.message });
  }
}

module.exports = {
  createGatePass,
  getMyGatePasses,
  getAllGatePasses,
  updatePassStatus,
  getGuardPasses,
  markCheckOutIn
};