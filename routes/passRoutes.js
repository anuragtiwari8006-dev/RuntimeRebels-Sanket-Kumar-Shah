const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createGatePass,
  getMyGatePasses,
  getAllGatePasses,
  updatePassStatus,
  getGuardPasses,
  markCheckOutIn
} = require('../controllers/passController');

// Resident Routes
router.post('/', authMiddleware, createGatePass);
router.get('/my', authMiddleware, getMyGatePasses);

// Warden Routes
router.get('/all', authMiddleware, getAllGatePasses);
router.patch('/:id/status', authMiddleware, updatePassStatus);

// Security Guard Routes
router.get('/guard', authMiddleware, getGuardPasses);
router.patch('/:id/security', authMiddleware, markCheckOutIn);

module.exports = router;