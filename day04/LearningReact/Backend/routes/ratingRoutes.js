const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');

const protectUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

router.post('/:doctorId', protectUser, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { rating, review, userName } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.ratings.push({
      userId: req.user.id,
      userName: userName || req.user.name || '',
      rating,
      review: review || ''
    });

    const totalRatings = doctor.ratings.length;
    const totalScore = doctor.ratings.reduce((sum, item) => sum + item.rating, 0);

    doctor.ratingSummary.count = totalRatings;
    doctor.ratingSummary.average = totalRatings ? totalScore / totalRatings : 0;

    await doctor.save();

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      ratingSummary: doctor.ratingSummary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;