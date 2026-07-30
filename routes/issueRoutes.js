const express = require('express');
const router = express.Router();
const { createIssue, getIssues, updateIssueStatus } = require('../controllers/issueController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.post('/', verifyToken, authorizeRoles('RESIDENT'), createIssue);
router.get('/', verifyToken, authorizeRoles('RESIDENT', 'WARDEN'), getIssues);
router.patch('/:id/status', verifyToken, authorizeRoles('WARDEN'), updateIssueStatus);

module.exports = router;