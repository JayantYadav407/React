const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  // --- Auth & Identification ---
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Required for secure login
  role: { type: String, default: 'doctor' },  // Essential for app-wide role checking
  profileImage: { type: String },

  // --- Professional Profile ---
  specialization: { type: String, required: true }, // e.g., Cardiologist
  proficiency: { type: String },                    // Bio/Expertise
  skills: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
  credentials: { type: String },

  // --- Location & Discovery ---
  clinicLocation: {
    address: String,
    city: String,
    state: String
  },
  hospital: {
    name: String,
    address: String,
    city: String
  },

  // --- Pricing ---
  fees: {
    regular: { type: Number, required: true, default: 500 },
    emergency: { type: Number, required: true, default: 1200 }
  },

  // --- Scheduling & Availability ---
  // Recurring weekly availability
  availability: [{
    day: { 
      type: String, 
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] 
    },
    slots: [{
      startTime: String, // e.g., "09:00"
      endTime: String,   // e.g., "10:00"
      isBooked: { type: Boolean, default: false }
    }]
  }],
  blackoutDates: [Date], // For leave/unavailability
  
  createdAt: { type: Date, default: Date.now }
});

// Indexing for rapid searching by users
doctorSchema.index({ 
  specialization: 'text', 
  proficiency: 'text', 
  'clinicLocation.city': 'text',
  'hospital.name': 'text' 
});

module.exports = mongoose.model('Doctor', doctorSchema);