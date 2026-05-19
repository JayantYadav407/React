// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer'); // 🌟 Added for handling the profile avatar file upload
const User = require('../models/Patient.js'); 

// Configure Multer to intercept raw binary media files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB maximum limit for profile photos
});

// 🔒 Authentication Middleware to verify incoming JWT Tokens
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
// @desc    Update user profile records (Handles multi-part fields + image files)
router.put('/profile/update', protect, upload.single('avatar'), async (req, res) => {
  try {
    // Log this in your terminal to see exactly what your frontend is sending!
    console.log("Incoming Text Data:", req.body);
    console.log("Incoming File Data:", req.file);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update Core Personal Fields safely
    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.gender = req.body.gender || user.gender;
    user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
    user.physicalAddress = req.body.physicalAddress !== undefined ? req.body.physicalAddress : user.physicalAddress;
    
    if (req.body.dob) {
      user.dob = new Date(req.body.dob);
    }

    // Process Avatar File
    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      user.avatarUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    }

    // Strict string array handling to avoid saving blank elements
    user.medicalHistory = {
      chronicIllnesses: req.body.chronicIllnesses ? req.body.chronicIllnesses.split(',').map(s => s.trim()).filter(Boolean) : user.medicalHistory.chronicIllnesses,
      allergies: req.body.allergies ? req.body.allergies.split(',').map(s => s.trim()).filter(Boolean) : user.medicalHistory.allergies,
      pastSurgeries: req.body.pastSurgeries ? req.body.pastSurgeries.split(',').map(s => s.trim()).filter(Boolean) : user.medicalHistory.pastSurgeries,
      currentMedications: req.body.currentMedications ? req.body.currentMedications.split(',').map(s => s.trim()).filter(Boolean) : user.medicalHistory.currentMedications
    };

    // Explicitly tell Mongoose that these deep nested object arrays have changed
    user.markModified('medicalHistory');

    const updatedUser = await user.save();
    
    // Return the absolute fresh document from MongoDB back to React
    res.status(200).json(updatedUser);

  } catch (error) {
    console.error("Profile Update Database Error:", error);
    res.status(500).json({ message: 'Server error saving profile changes', error: error.message });
  }
});

module.exports = router;