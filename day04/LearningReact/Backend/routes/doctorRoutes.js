const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor.js');
const { protectDoctor } = require('../middleware/authMiddleware');

const router = express.Router();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(ext, '').replace(/\s+/g, '_');
    cb(null, `${name}_${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only jpg, png, and webp images are allowed'));
};

const upload = multer({ storage, fileFilter });

const parseMaybeJSON = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const toMinutes = (time) => {
  if (!time || typeof time !== 'string') return NaN;
  const m = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return NaN;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return NaN;
  return h * 60 + min;
};

const normalizeTime = (time) => {
  const mins = toMinutes(time);
  if (Number.isNaN(mins)) return null;
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
};

const validateSchedule = (availability, blackoutDates = []) => {
  if (!Array.isArray(availability)) return 'Availability must be an array.';

  const seenDays = new Set();
  for (const dayEntry of availability) {
    if (!dayEntry || !DAYS.includes(dayEntry.day)) return `Invalid day: ${dayEntry?.day}`;
    if (seenDays.has(dayEntry.day)) return `Duplicate schedule for ${dayEntry.day}`;
    seenDays.add(dayEntry.day);

    const slots = Array.isArray(dayEntry.slots) ? dayEntry.slots : [];
    const normalized = slots
      .map((slot) => ({
        startTime: normalizeTime(slot.startTime),
        endTime: normalizeTime(slot.endTime),
        isBooked: !!slot.isBooked
      }))
      .filter((slot) => slot.startTime && slot.endTime);

    if (dayEntry.isClosed === true) continue;
    if (normalized.length === 0) return `${dayEntry.day} must have at least one slot or be marked closed`;

    normalized.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

    for (let i = 0; i < normalized.length; i++) {
      const slot = normalized[i];
      const start = toMinutes(slot.startTime);
      const end = toMinutes(slot.endTime);
      if (!(start < end)) return `${dayEntry.day}: start time must be before end time`;
      if (i > 0) {
        const prev = normalized[i - 1];
        const prevEnd = toMinutes(prev.endTime);
        if (start - prevEnd < 10) return `${dayEntry.day}: each slot must have at least 10 minutes gap`;
      }
    }
  }

  if (!Array.isArray(blackoutDates)) return 'blackoutDates must be an array.';
  return null;
};

router.get('/me', protectDoctor, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).lean();
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/me', protectDoctor, upload.single('profileImageFile'), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const body = req.body;
    const updateData = {};

    if (req.file) {
      if (doctor.profileImage && doctor.profileImage.startsWith('/uploads/')) {
        const oldFilePath = path.join(process.cwd(), doctor.profileImage);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    if (body.specialization !== undefined && body.specialization !== '') updateData.specialization = body.specialization;
    if (body.proficiency !== undefined) updateData.proficiency = body.proficiency;

    if (body.skills !== undefined) {
      updateData.skills = Array.isArray(body.skills)
        ? body.skills
        : String(body.skills).split(',').map(s => s.trim()).filter(Boolean);
    }

    if (body.experienceYears !== undefined && body.experienceYears !== '') {
      updateData.experienceYears = Number(body.experienceYears || 0);
    }

    if (body.credentials !== undefined) updateData.credentials = body.credentials;
    if (body.hospitalType !== undefined) updateData.hospitalType = body.hospitalType;

    if (body.clinicLocation !== undefined) updateData.clinicLocation = parseMaybeJSON(body.clinicLocation);
    if (body.hospital !== undefined) updateData.hospital = parseMaybeJSON(body.hospital);

    if (body.fees !== undefined) {
      const parsedFees = parseMaybeJSON(body.fees);
      updateData.fees = {
        regular: parsedFees?.regular ?? doctor.fees?.regular,
        emergency: parsedFees?.emergency ?? doctor.fees?.emergency
      };
    }

    if (body.conditionsTreated !== undefined) {
      updateData.conditionsTreated = Array.isArray(body.conditionsTreated)
        ? body.conditionsTreated
        : String(body.conditionsTreated).split(',').map(s => s.trim()).filter(Boolean);
    }

    if (body.services !== undefined) {
      updateData.services = Array.isArray(body.services)
        ? body.services
        : String(body.services).split(',').map(s => s.trim()).filter(Boolean);
    }

    if (body.availability !== undefined) updateData.availability = parseMaybeJSON(body.availability);

    if (body.blackoutDates !== undefined) {
      updateData.blackoutDates = Array.isArray(body.blackoutDates)
        ? body.blackoutDates
        : String(body.blackoutDates).split(',').map(s => s.trim()).filter(Boolean);
    }

    Object.assign(doctor, updateData);

    const updatedDoctor = await doctor.save();
    const safeDoctor = await Doctor.findById(updatedDoctor._id).select('-password').lean();

    return res.json({ message: 'Doctor profile updated successfully', doctor: safeDoctor });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    return res.status(500).json({ message: error.message });
  }
});

router.get('/me/schedule', protectDoctor, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select('availability blackoutDates fullName specialization fees clinicLocation hospital hospitalType').lean();
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const safeAvailability = Array.isArray(doctor.availability) ? doctor.availability : [];
    const safeBlackouts = Array.isArray(doctor.blackoutDates) ? doctor.blackoutDates : [];

    res.json({
      success: true,
      schedule: {
        availability: safeAvailability,
        blackoutDates: safeBlackouts,
        meta: {
          doctorName: doctor.fullName,
          specialization: doctor.specialization,
          clinicLocation: doctor.clinicLocation,
          hospital: doctor.hospital,
          hospitalType: doctor.hospitalType,
          fees: doctor.fees
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/me/schedule', protectDoctor, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const availability = parseMaybeJSON(req.body.availability);
    const blackoutDates = parseMaybeJSON(req.body.blackoutDates);

    const errMsg = validateSchedule(availability, blackoutDates);
    if (errMsg) return res.status(400).json({ message: errMsg });

    const normalizedAvailability = availability.map((dayEntry) => ({
      day: dayEntry.day,
      isClosed: !!dayEntry.isClosed,
      slots: Array.isArray(dayEntry.slots)
        ? dayEntry.slots
            .map((slot) => ({
              startTime: normalizeTime(slot.startTime),
              endTime: normalizeTime(slot.endTime),
              isBooked: !!slot.isBooked,
              appointmentId: slot.appointmentId || null
            }))
            .filter((slot) => slot.startTime && slot.endTime)
            .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
        : []
    }));

    doctor.availability = normalizedAvailability;
    doctor.blackoutDates = Array.isArray(blackoutDates)
      ? blackoutDates.map((d) => new Date(d)).filter((d) => !isNaN(d.getTime()))
      : [];

    const saved = await doctor.save();
    const safeDoctor = await Doctor.findById(saved._id).select('-password').lean();

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      doctor: safeDoctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/me', protectDoctor, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    if (doctor.profileImage && doctor.profileImage.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), doctor.profileImage);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Doctor.findByIdAndDelete(req.user.id);
    res.json({ message: 'Doctor profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;