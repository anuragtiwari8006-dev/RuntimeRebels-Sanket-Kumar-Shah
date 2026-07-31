const Issue = require('../models/issue');

// 1. Resident: Create issue
async function createIssue(req, res) {
  try {
    const { title, category, description, roomNumber, urgency } = req.body;
    const studentId = req.user.id || req.user._id;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const newIssue = new Issue({
      student: studentId,
      title,
      category: category || 'General',
      description,
      roomNumber: roomNumber || req.user.roomNumber || 'N/A',
      urgency: urgency || 'MEDIUM'
    });

    await newIssue.save();
    return res.status(201).json({ message: 'Issue submitted successfully!', issue: newIssue });
  } catch (error) {
    console.error('Create Issue Error:', error);
    return res.status(500).json({ message: 'Failed to create issue.', error: error.message });
  }
}

// 2. Resident: Get logged-in user's issues
async function getMyIssues(req, res) {
  try {
    const studentId = req.user.id || req.user._id;
    const issues = await Issue.find({ student: studentId }).sort({ createdAt: -1 });
    return res.status(200).json(issues);
  } catch (error) {
    console.error('Get My Issues Error:', error);
    return res.status(500).json({ message: 'Failed to fetch your issues.', error: error.message });
  }
}

// 3. Warden: Get all issues
async function getAllIssues(req, res) {
  try {
    const issues = await Issue.find()
      .populate('student', 'name email roomNumber')
      .sort({ createdAt: -1 });

    return res.status(200).json(issues);
  } catch (error) {
    console.error('Get All Issues Error:', error);
    return res.status(500).json({ message: 'Failed to fetch issues.', error: error.message });
  }
}

// 4. Warden: Update issue status
async function updateIssueStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const issue = await Issue.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    return res.status(200).json({ message: 'Status updated successfully', issue });
  } catch (error) {
    console.error('Update Status Error:', error);
    return res.status(500).json({ message: 'Failed to update issue status.', error: error.message });
  }
}

module.exports = {
  createIssue,
  getMyIssues,
  getAllIssues,
  updateIssueStatus
};