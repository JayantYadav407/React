const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { protectDoctor } = require('../middleware/authMiddleware');

const protectUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("error free1");
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("error free2");
      return res.status(401).json({ message: 'No token provided' });

    }
      console.log("error free3");
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log("error free4");
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

router.post('/:doctorId', protectUser, async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor id' });
    }

    const {
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      reason,
      preferredDate,
      preferredTime
    } = req.body;

    if (!patientName || !preferredDate || !preferredTime) {
      return res.status(400).json({
        message: 'patientName, preferredDate, and preferredTime are required'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const appointment = await Appointment.create({
      doctor: doctorId,
      userId: req.user.id,
      userName: req.user.name || '',
      patientName,
      patientPhone: patientPhone || '',
      patientAge: patientAge !== undefined && patientAge !== '' ? Number(patientAge) : null,
      patientGender: patientGender || '',
      reason: reason || '',
      preferredDate,
      preferredTime,
      status: 'Pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment request sent successfully',
      appointment
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/doctor/me', protectDoctor, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const summary = {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'Pending').length,
      handled: appointments.filter(a => a.status === 'Handled').length,
      rejected: appointments.filter(a => a.status === 'Rejected').length
    };

    res.json({ appointments, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/doctor/:doctorId', protectDoctor, async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor id' });
    }

    const appointments = await Appointment.find({ doctor: doctorId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:appointmentId/status', protectDoctor, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment id' });
    }

    if (!['Pending', 'Handled', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found11' });
    }

    if (String(appointment.doctor) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    appointment.status = status;
    appointment.handledBy = req.user.id;
    appointment.handledAt = new Date();

    const updated = await appointment.save();

    res.json({
      success: true,
      message: `Appointment marked as ${status}`,
      appointment: updated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:appointmentId', protectDoctor, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment id' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found12' });
    }

    if (String(appointment.doctor) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    await Appointment.findByIdAndDelete(appointmentId);

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;