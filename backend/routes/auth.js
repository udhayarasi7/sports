const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'sportshub_secret_key_12345';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, playerDetails, coachDetails, organizerDetails, phone } = req.req_body || req.body;

    // Check if MongoDB is offline - return mock fallback so user is not blocked (Dev mode only)
    if (mongoose.connection.readyState !== 1) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, message: 'Database offline. Please try again later.' });
      }
      console.log('MongoDB is offline - returning mock registration details');
      const status = (role === 'coach' || role === 'organizer' || role === 'admin') ? 'pending' : 'approved';
      const mockUser = {
        id: `mock_reg_${Date.now()}`,
        name,
        email,
        phone,
        role,
        status,
        playerDetails,
        coachDetails,
        organizerDetails
      };
      const token = jwt.sign(
        { id: mockUser.id, role: mockUser.role, status: mockUser.status },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.status(201).json({
        success: true,
        token,
        user: mockUser
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Default status:
    // Players are approved by default. Coaches, Organizers and Admin are 'pending' to show the status splash gate in action.
    let status = 'approved';
    if (role === 'coach' || role === 'organizer' || role === 'admin') {
      status = 'pending';
    }

    const newUser = new User({
      name,
      email,
      password,
      role,
      status,
      phone,
      playerDetails,
      coachDetails,
      organizerDetails
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, status: newUser.status },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        phone: newUser.phone,
        playerDetails: newUser.playerDetails,
        coachDetails: newUser.coachDetails,
        organizerDetails: newUser.organizerDetails
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if MongoDB is offline - return mock login so user is not blocked (Dev mode only)
    if (mongoose.connection.readyState !== 1) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, message: 'Database offline. Please try again later.' });
      }
      console.log('MongoDB is offline - returning mock login details');
      let role = 'player';
      if (email.includes('coach')) role = 'coach';
      else if (email.includes('organizer')) role = 'organizer';
      else if (email.includes('admin')) role = 'admin';

      const status = (role === 'coach' || role === 'organizer' || role === 'admin') ? 'pending' : 'approved';
      const mockUser = {
        id: `mock_login_${Date.now()}`,
        name: email.split('@')[0],
        email,
        phone: '+91 99999 99999',
        role,
        status
      };
      const token = jwt.sign(
        { id: mockUser.id, role: mockUser.role, status: mockUser.status },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({
        success: true,
        token,
        user: mockUser
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    // Note: Dashboards check for status 'approved' in frontend/routes as well
    const token = jwt.sign(
      { id: user._id, role: user.role, status: user.status },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        playerDetails: user.playerDetails,
        coachDetails: user.coachDetails,
        organizerDetails: user.organizerDetails
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Get all users (useful for managers, coaches, and testing)
router.get('/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, message: 'Database offline.' });
      }
      return res.json({ success: true, users: [] });
    }
    const users = await User.find({}, '-password');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Update User Status (Approve / Reject) (PATCH)
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    if (mongoose.connection.readyState !== 1) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, message: 'Database offline.' });
      }
      return res.json({ success: true, user: { id: req.params.id, status } });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Update User Status (Approve / Reject) (PUT)
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    if (mongoose.connection.readyState !== 1) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, message: 'Database offline.' });
      }
      return res.json({ success: true, user: { id: req.params.id, status } });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('Update status error PUT:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
