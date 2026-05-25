// models/Appointment.js

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    bookedBy: {                           // 👈 who booked it (logged‑in Patient)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    patientName: {                        // 👈 for whom this appointment is (name)
      type: String,
      required: true
    },
    patientPhone: String,                 // 👈 phone of the person this is for
    patientAge: Number,                   // 👈 age of the person this is for
    patientGender: String,                // 👈 gender of the person this is for
    reason: String,                       // 👈 appointment reason
    preferredDate: {
      type: Date,
      required: true
    },
    preferredTime: {
      type: String,
      required: true
    },
    status: {
      type: String,
     enum: [
    'Pending',
    'Accepted',
    'Rejected',
    'Completed',
    'Cancelled'        // ✅ add this
  ],  // ✅ updated
      default: 'Pending'
    },

    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    handledAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);