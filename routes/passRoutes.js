const express = require('express');
const router = express.Router();
const { 
  createPass, 
  getResidentPasses, 
  verifyPass, 
  toggleLockdown, 
  getLockdownStatus,
  getPendingPasses,
  updatePassStatus
} = require('../controllers/passController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.post('/request', verifyToken, authorizeRoles('RESIDENT'), createPass);
router.get('/my-passes', verifyToken, authorizeRoles('RESIDENT'), getResidentPasses);
router.post('/verify', verifyToken, authorizeRoles('SECURITY'), verifyPass);

// Warden Approval Routes
router.get('/pending', verifyToken, authorizeRoles('WARDEN'), getPendingPasses);
router.patch('/:id/status', verifyToken, authorizeRoles('WARDEN'), updatePassStatus);

// Lockdown Routes
router.post('/lockdown/toggle', verifyToken, authorizeRoles('WARDEN'), toggleLockdown);
router.get('/lockdown/status', verifyToken, getLockdownStatus);

module.exports = router;