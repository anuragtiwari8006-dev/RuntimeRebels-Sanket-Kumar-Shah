const User = require('../models/user');
const jwt = require('jsonwebtoken');

// 1. Register User
async function register(req, res) {
  try {
    const { name, email, password, role, roomNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      role: role || 'RESIDENT',
      roomNumber: roomNumber || ''
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, roomNumber: user.roomNumber },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roomNumber: user.roomNumber
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
}

// 2. Login User
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password.trim());
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, roomNumber: user.roomNumber },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roomNumber: user.roomNumber
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
}

// 3. Update Password
async function updatePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id || req.user._id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (oldPassword) {
      const isMatch = await user.comparePassword(oldPassword.trim());
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect old password.' });
      }
    }

    user.password = newPassword.trim();
    await user.save(); // Triggers userSchema pre-save hashing

    return res.status(200).json({ message: 'Password updated successfully!' });

  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ message: 'Server error updating password.', error: error.message });
  }
}

module.exports = {
  register,
  login,
  updatePassword
};