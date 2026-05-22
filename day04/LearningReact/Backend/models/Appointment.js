const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patientName: { type: String, required: true },
  patientPhone: { type: String },
  patientAge: { type: Number },
  patientGender: { type: String },
  reason: { type: String },
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Handled', 'Rejected'], default: 'Pending' },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  handledAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);