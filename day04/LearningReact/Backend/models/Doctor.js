const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, default: '' },
    patientName: { type: String, required: true },
    patientPhone: { type: String, default: '' },
    patientAge: { type: Number, default: null },
    patientGender: { type: String, default: '' },
    reason: { type: String, default: '' },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const patientHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    patientName: { type: String, required: true },
    diagnosis: { type: String, default: '' },
    treatment: { type: String, default: '' },
    notes: { type: String, default: '' },
    visitDate: { type: Date, default: Date.now }
  },
  { _id: true }
);

const availabilitySlotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null }
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    slots: [availabilitySlotSchema]
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'doctor' },
  profileImage: { type: String, default: '' },

  specialization: { type: String, required: true },
  proficiency: { type: String, default: '' },
  skills: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
  credentials: { type: String, default: '' },

  conditionsTreated: [{ type: String }],
  services: [{ type: String }],

  clinicLocation: {
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' }
  },

  hospital: {
    name: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' }
  },

  hospitalType: {
    type: String,
    enum: ['Government', 'Private'],
    default: 'Private'
  },

  fees: {
    regular: { type: Number, required: true, default: 500 },
    emergency: { type: Number, required: true, default: 1200 }
  },

  availability: [availabilitySchema],
  blackoutDates: [{ type: Date }],

  ratings: [ratingSchema],
  ratingSummary: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },

  appointments: [appointmentSchema],
  patientHistory: [patientHistorySchema],

  createdAt: { type: Date, default: Date.now }
});

doctorSchema.index({
  fullName: 'text',
  specialization: 'text',
  proficiency: 'text',
  skills: 'text',
  conditionsTreated: 'text',
  services: 'text',
  'clinicLocation.city': 'text',
  'hospital.name': 'text'
});

module.exports = mongoose.model('Doctor', doctorSchema);