// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/Patient.js'); // Adjust this path based on where your User model is located

// 🔒 Simple Authentication Middleware to verify incoming JWT Tokens
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find the user associated with the token and attach them to the request object
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// @route   GET /api/user/profile
// @desc    Get current logged-in user's profile data
router.get('/profile', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error loading profile', error: error.message });
  }
});

// @route   PUT /api/user/profile/update
// @desc    Update user profile records
router.put('/profile/update', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Dynamic field updating assignment safely falling back to current values
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Add any extra parameters you want editable here (e.g., phone, age)
    if (req.body.phone) user.phone = req.body.phone;

    const updatedUser = await user.save();
    
    // Return clean object without the sensitive hashed password
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error saving profile changes', error: error.message });
  }
});

module.exports = router;