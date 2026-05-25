const mongoose = require('mongoose');
const NodeGeocoder = require('node-geocoder');
const { HfInference } = require('@huggingface/inference');

const geocoder = NodeGeocoder({ provider: 'openstreetmap' });
const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

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
    isClosed: { type: Boolean, default: false },
    slots: [availabilitySlotSchema]
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  about: { type: String, default: '' },
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
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  embedding: { type: [Number] },

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
    emergency: { type: Number, required: true, default: 1500 }
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
  location: '2dsphere',
  'clinicLocation.city': 'text',
  'hospital.name': 'text'
});

doctorSchema.methods.getDaySchedule = function (dayName) {
  return Array.isArray(this.availability) ? this.availability.find((d) => d.day === dayName) : null;
};

doctorSchema.methods.syncSlotBooking = function (dayName, preferredTime, appointmentId, booked) {
  const day = this.getDaySchedule(dayName);
  if (!day || !Array.isArray(day.slots)) return false;

  const time = String(preferredTime).slice(0, 5);
  const slot = day.slots.find((s) => String(s.startTime).slice(0, 5) === time);
  if (!slot) return false;

  slot.isBooked = booked;
  slot.appointmentId = booked ? appointmentId : null;
  return true;
};

doctorSchema.methods.freeAppointmentSlot = function (appointment) {
  if (!appointment || !appointment.preferredDate || !appointment.preferredTime) return false;
  const local = new Date(appointment.preferredDate);
  if (isNaN(local.getTime())) return false;
  const dayName = local.toLocaleDateString('en-US', { weekday: 'long' });
  return this.syncSlotBooking(dayName, appointment.preferredTime, appointment._id, false);
};

doctorSchema.pre('save', async function() {
  try {
    if (this.isModified('clinicLocation')) {
      const addressStr = `${this.clinicLocation.address}, ${this.clinicLocation.city}, ${this.clinicLocation.state}`;
      const res = await geocoder.geocode(addressStr);
      if (res && res.length > 0) {
        this.location = { type: 'Point', coordinates: [res[0].longitude, res[0].latitude] };
      }
    }

    const textToEmbed = [
      this.fullName,
      this.specialization,
      this.proficiency,
      this.credentials,
      this.skills ? this.skills.join(' ') : '',
      this.conditionsTreated ? this.conditionsTreated.join(' ') : '',
      this.services ? this.services.join(' ') : '',
      this.clinicLocation ? this.clinicLocation.city : '',
      this.clinicLocation ? this.clinicLocation.state : '',
      this.hospital ? this.hospital.name : ''
    ].filter(Boolean).join(' ');

    const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: textToEmbed
    });

    this.embedding = Array.isArray(response) && Array.isArray(response[0]) ? response[0] : response;
  } catch (err) {
    console.error("Middleware Error embedding :", err);
    throw err;
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);