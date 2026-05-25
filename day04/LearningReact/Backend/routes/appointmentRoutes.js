// ✅ FILE: routes/appointments.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { protectDoctor } = require('../middleware/authMiddleware');


const protectUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};


// ✅ Helper: convert time string to minutes
const toMinutes = (time) => {
  if (!time || typeof time !== 'string') return NaN;
  const m = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return NaN;
  return Number(m[1]) * 60 + Number(m[2]);
};


// ✅ Helper: normalize time to 5 chars (e.g. "09:30:00" → "09:30")
const normalizeTime = (time) => {
  if (!time || typeof time !== 'string') return '';
  return time.slice(0, 5);
};


// ✅ Helper: format a date value to "YYYY-MM-DD"
const localDateOnly = (dateValue) => {
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


// ✅ 1. POST /api/appointments/:doctorId – create new appointment
router.post('/:doctorId', protectUser, async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor id' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const {
      preferredDate,
      preferredTime
    } = req.body;

    if (!preferredDate || !preferredTime) {
      return res.status(400).json({
        message: 'preferredDate and preferredTime are required'
      });
    }

    const selectedDate = new Date(preferredDate);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid preferred date' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 60);

    if (selectedDate < today) {
      return res.status(400).json({ message: 'Please select an upcoming date' });
    }

    if (selectedDate > maxDate) {
      return res.status(400).json({ message: 'Appointments can only be booked within the next 60 days' });
    }

    let {
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      reason
    } = req.body;

    const patientProfile = await Patient.findById(req.user.id).lean();

    if (!patientName && patientProfile?.name) patientName = patientProfile.name;
    if (!patientPhone && patientProfile?.phone) patientPhone = patientProfile.phone;

    if ((patientAge === undefined || patientAge === null || patientAge === '') && patientProfile?.dob) {
      const dob = new Date(patientProfile.dob);
      if (!isNaN(dob.getTime())) {
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
        patientAge = age >= 0 ? age : null;
      }
    }

    if (!patientGender && patientProfile?.gender) patientGender = patientProfile.gender;

    if (!patientName) {
      return res.status(400).json({ message: 'patientName is required' });
    }

    const blackoutDates = Array.isArray(doctor.blackoutDates) ? doctor.blackoutDates : [];
    const isBlackout = blackoutDates.some((d) => {
      const dd = new Date(d);
      return !isNaN(dd.getTime()) && dd.toDateString() === selectedDate.toDateString();
    });

    if (isBlackout) {
      return res.status(400).json({ message: 'Doctor is on leave for the selected date' });
    }

    const weekday = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const daySchedule = Array.isArray(doctor.availability)
      ? doctor.availability.find((d) => d.day === weekday)
      : null;

    if (!daySchedule || daySchedule.isClosed) {
      return res.status(400).json({ message: 'Doctor is not available on the selected day' });
    }

    const requestedMinutes = toMinutes(preferredTime);
    if (Number.isNaN(requestedMinutes)) {
      return res.status(400).json({ message: 'Invalid preferred time format' });
    }

    const validSlot = Array.isArray(daySchedule.slots)
      ? daySchedule.slots.find((slot) => {
          const start = toMinutes(slot.startTime);
          const end = toMinutes(slot.endTime);
          return Number.isFinite(start) && Number.isFinite(end) && requestedMinutes >= start && requestedMinutes < end;
        })
      : null;

    if (!validSlot) {
      return res.status(400).json({ message: 'Selected time is outside doctor availability' });
    }

    const requestDuration = 10;
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      doctorId,
      preferredDate: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ['Pending', 'Accepted'] }
    }).lean();

    const requestedStart = requestedMinutes;
    const requestedEnd = requestedMinutes + requestDuration;

    const conflict = existingAppointments.some((appt) => {
      const apptStart = toMinutes(appt.preferredTime);
      if (Number.isNaN(apptStart)) return false;
      const apptEnd = apptStart + requestDuration;
      return requestedStart < apptEnd + 10 && requestedEnd + 10 > apptStart;
    });

    if (conflict) {
      return res.status(400).json({
        message: 'Selected time is already booked or too close to another appointment'
      });
    }

    const appointment = await Appointment.create({
      doctorId,
      bookedBy: req.user.id,              // 👈 the logged‑in patient (who booked)
      patientName,                        // 👈 the person this appointment is for
      patientPhone,
      patientAge,
      patientGender,
      reason,
      preferredDate: selectedDate,
      preferredTime: normalizeTime(preferredTime),
      status: 'Pending'
    });

    try {
      const patient = await Patient.findById(req.user.id);
      if (patient) {
        patient.appointments.push({
          appointmentId: appointment._id,
          doctorName: doctor.name || doctor.fullName || 'Unknown Doctor',
          department: doctor.department || 'General',
          specialty: doctor.specialization || doctor.specialty || 'General',
          appointmentDate: new Date(`${preferredDate}T${normalizeTime(preferredTime)}`),
          status: 'Scheduled',
          notes: reason || ''
        });
        await patient.save({ validateBeforeSave: false });
      }
    } catch (profileError) {
      console.error('⚠️ Warning: Could not update patient profile:', profileError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Appointment request sent successfully',
      appointment
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Appointment validation failed',
        errors: messages
      });
    }
    return res.status(500).json({ message: error.message });
  }
});


// ✅ 2. GET /api/appointments/user/me
router.get('/user/me', protectUser, async (req, res) => {
  try {
    const appointments = await Appointment.find({ bookedBy: req.user.id })  // 👈 changed from userId to bookedBy
      .populate('doctorId', 'name fullName specialty specialization department email phone')
      .sort({ createdAt: -1 })
      .lean();

    console.log('✅ Appointments with populated doctor:', appointments);

    const formattedAppointments = appointments.map(appt => ({
      _id: appt._id,
      doctorId: appt.doctorId?._id,
      doctorName: appt.doctorId?.name || appt.doctorId?.fullName || 'Unknown Doctor',
      specialty: appt.doctorId?.specialty || appt.doctorId?.specialization || 'General',
      department: appt.doctorId?.department || 'Triage',
      doctorEmail: appt.doctorId?.email || '',
      doctorPhone: appt.doctorId?.phone || '',
      appointmentDate: appt.preferredDate ? new Date(appt.preferredDate).toISOString() : null,
      status: appt.status,
      patientName: appt.patientName,
      patientPhone: appt.patientPhone,
      patientAge: appt.patientAge,
      patientGender: appt.patientGender,
      reason: appt.reason,
      preferredDate: appt.preferredDate,
      preferredTime: appt.preferredTime,
      createdAt: appt.createdAt
    }));

    res.json({ appointments: formattedAppointments });
  } catch (error) {
    console.error('❌ Fetch appointments error:', error);
    res.status(500).json({ message: error.message });
  }
});


// ✅ 3. DELETE /api/appointments/user/:appointmentId
router.delete('/user/:appointmentId', protectUser, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    console.log('🔍 Cancel request - appointmentId:', appointmentId);
    console.log('🔍 User ID:', req.user.id);

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      console.log('⚠️ Invalid ObjectId, trying to find by user...');

      const appointment = await Appointment.findOne({
        bookedBy: req.user.id,            // 👈 changed from userId
        status: { $in: ['Pending', 'Accepted', 'Scheduled'] }
      }).sort({ createdAt: -1 });

      if (!appointment) {
        return res.status(404).json({
          message: 'No cancellable appointments found for your account'
        });
      }

      console.log('✅ Found appointment by user:', appointment._id);

      appointment.status = 'Cancelled';
      await appointment.save();

      try {
        const patient = await Patient.findById(req.user.id);
        if (patient) {
          const apptDate = appointment.preferredDate ? new Date(appointment.preferredDate).toISOString().split('T')[0] : '';
          const profileAppt = patient.appointments.find(a =>
            a.appointmentDate &&
            a.appointmentDate.toISOString().split('T')[0] === apptDate
          );

          if (profileAppt) {
            profileAppt.status = 'Cancelled';
            await patient.save({ validateBeforeSave: false });
          }
        }
      } catch (profileError) {
        console.error('⚠️ Warning: Could not update patient profile:', profileError.message);
      }

      console.log('✅ Appointment cancelled - Status updated to:', appointment.status);

      return res.json({
        success: true,
        message: 'Appointment cancelled successfully',
        appointment
      });
    }

    let appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      console.log('❌ Appointment not found by ID. Searching by user...');

      const userAppointment = await Appointment.findOne({
        bookedBy: req.user.id,            // 👈 changed from userId
        _id: appointmentId
      });

      if (!userAppointment) {
        return res.status(404).json({
          message: 'Appointment not found',
          helperText: 'Please try refreshing the page and try again'
        });
      }

      appointment = userAppointment;
    }

    if (String(appointment.bookedBy) !== String(req.user.id)) {     // 👈 changed from userId
      return res.status(403).json({ message: 'Not allowed to cancel this appointment' });
    }

    if (!['Pending', 'Accepted', 'Scheduled'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Only pending or accepted appointments can be cancelled' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    console.log('✅ Appointment cancelled successfully');
    console.log('✅ Appointment ID:', appointment._id);
    console.log('✅ New Status:', appointment.status);
    console.log('✅ Doctor ID:', appointment.doctorId);

    try {
      const patient = await Patient.findById(req.user.id);
      if (patient) {
        const apptDate = appointment.preferredDate ? new Date(appointment.preferredDate).toISOString().split('T')[0] : '';

        const profileAppt = patient.appointments.find(a =>
          a.appointmentDate &&
          a.appointmentDate.toISOString().split('T')[0] === apptDate
        );

        if (profileAppt) {
          profileAppt.status = 'Cancelled';
          await patient.save({ validateBeforeSave: false });
          console.log('✅ Appointment cancelled in patient profile');
        }
      }
    } catch (profileError) {
      console.error('⚠️ Warning: Could not update patient profile:', profileError.message);
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('❌ Cancel error:', error);
    res.status(500).json({ message: error.message });
  }
});


// ✅ 4. GET /api/appointments/doctor/me
router.get('/doctor/me', protectDoctor, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    console.log('📋 Doctor appointments:', appointments.length);

    const summary = {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'Pending').length,
      accepted: appointments.filter(a => a.status === 'Accepted').length,
      completed: appointments.filter(a => a.status === 'Completed').length,
      rejected: appointments.filter(a => a.status === 'Rejected').length,
      cancelled: appointments.filter(a => a.status === 'Cancelled').length
    };

    const formattedAppointments = appointments.map(appt => ({
      _id: appt._id,
      doctorId: appt.doctorId,
      bookedBy: appt.bookedBy,            // 👈 who booked it (logged‑in patient)
      patientName: appt.patientName || 'Unknown Patient',
      patientPhone: appt.patientPhone || '',
      patientAge: appt.patientAge,
      patientGender: appt.patientGender,
      appointmentDate: appt.preferredDate ? new Date(appt.preferredDate).toISOString() : null,
      preferredTime: appt.preferredTime,
      status: appt.status,
      reason: appt.reason || ''
    }));

    res.json({ appointments: formattedAppointments, summary });
  } catch (error) {
    console.error('❌ Fetch doctor appointments error:', error);
    res.status(500).json({ message: error.message });
  }
});


// ✅ 5. GET /api/appointments/doctor/:doctorId
router.get('/doctor/:doctorId', protectDoctor, async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor id' });
    }

    const appointments = await Appointment.find({ doctorId: doctorId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ 6. PATCH /api/appointments/:appointmentId/status
router.patch('/:appointmentId/status', protectDoctor, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment id' });
    }

      if (!['Pending', 'Accepted', 'Rejected', 'Completed','Cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (String(appointment.doctorId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    appointment.status = status;
    if (status === 'Accepted' || status === 'Completed') {
      appointment.handledAt = new Date();
    }
    await appointment.save();

    try {
      const patient = await Patient.findById(appointment.bookedBy);   // 👈 changed from userId
      if (patient) {
        const apptDate = appointment.preferredDate ? new Date(appointment.preferredDate).toISOString().split('T')[0] : '';

        patient.appointments.forEach(appt => {
          if (appt.appointmentDate &&
              appt.appointmentDate.toISOString().split('T')[0] === apptDate) {
            if (status === 'Accepted') {
              appt.status = 'Scheduled';
            } else if (status === 'Completed') {
              appt.status = 'Completed';
            } else if (status === 'Rejected') {
              appt.status = 'Cancelled';
            }
          }
        });

        await patient.save({ validateBeforeSave: false });
        console.log('✅ Appointment status updated in patient profile');
      }
    } catch (profileError) {
      console.error('⚠️ Warning: Could not update patient profile:', profileError.message);
    }

    res.json({
      success: true,
      message: `Appointment marked as ${status}`,
      appointment: appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ 7. DELETE /api/appointments/:appointmentId
router.delete('/:appointmentId', protectDoctor, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment id' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (String(appointment.doctorId) !== String(req.user.id)) {
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