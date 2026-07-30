const Issue = require('../models/Issue');

// Map priority to SLA hours
const SLA_MAP = {
  EMERGENCY: 4,
  HIGH: 12,
  MEDIUM: 24,
  LOW: 48
};

// Resident: Create new complaint
exports.createIssue = async (req, res) => {
  try {
    const { category, priority, description } = req.body;
    const slaHours = SLA_MAP[priority] || 24;

    const issue = new Issue({
      resident: req.user.id,
      roomNumber: req.user.roomNumber || '302',
      category,
      priority,
      description,
      slaHours
    });

    await issue.save();
    res.status(201).json({ message: 'Complaint registered successfully', issue });
  } catch (err) {
    res.status(500).json({ message: 'Error logging complaint', error: err.message });
  }
};

// Get issues (Residents see their own; Wardens see ALL)
exports.getIssues = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'RESIDENT') {
      query.resident = req.user.id;
    }

    const issues = await Issue.find(query)
      .populate('resident', 'name email roomNumber phone')
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching issues', error: err.message });
  }
};

// Warden: Update issue status
exports.updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };

    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }

    const issue = await Issue.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: 'Status updated', issue });
  } catch (err) {
    res.status(500).json({ message: 'Error updating issue status', error: err.message });
  }
};