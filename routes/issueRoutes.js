const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  createIssue, 
  getMyIssues, 
  getAllIssues, 
  updateIssueStatus 
} = require('../controllers/issueController');

// Student endpoints
router.post('/', authMiddleware, createIssue);
router.get('/my', authMiddleware, getMyIssues);

// Warden endpoints
router.get('/all', authMiddleware, getAllIssues);
router.patch('/:id/status', authMiddleware, updateIssueStatus);
router.put('/:id/status', authMiddleware, updateIssueStatus);

module.exports = router;