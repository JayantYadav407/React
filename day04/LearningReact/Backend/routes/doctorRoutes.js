const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');

const protectDoctor = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.doctorId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

router.get('/me', protectDoctor, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctorId).select('-password').lean();
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    return res.json(doctor);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password').lean();
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    return res.json(doctor);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;