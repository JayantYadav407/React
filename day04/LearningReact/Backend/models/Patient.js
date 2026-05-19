const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PatientSchema = new mongoose.Schema({
  // 1. Authentication & Basic Info
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },

  // 2. General Patient Details
  age: {
    type: Number,
    required: [true, 'Age is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Gender is required']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },

  // 3. Physical & Geo-Location Data
  physicalAddress: {
    type: String, // Storing the text written by the user
    required: [true, 'Physical address is required']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'], // GeoJSON requirement
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude] -> NOTE THE ORDER!
      required: true
    }
  },

  // 4. Medical History
  medicalHistory: {
    chronicIllnesses: [{ type: String }], // e.g., ['Diabetes', 'Hypertension']
    allergies: [{ type: String }],        // e.g., ['Penicillin', 'Peanuts']
    pastSurgeries: [{ type: String }],
    currentMedications: [{ type: String }]
  },
  // 🌟 Added Date of Birth
  dob: { type: Date }, 
  
  // 🌟 Added Profile Image field
  avatarUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
  },

  medicalHistory: {
    chronicIllnesses: [{ type: String }],
    allergies: [{ type: String }],
    pastSurgeries: [{ type: String }],
    currentMedications: [{ type: String }]
  },

  // 🌟 Added Multi-Modal Triage Symptom History
  symptomHistory: [{
    timestamp: { type: Date, default: Date.now },
    userSymptomInput: { type: String },
    aiAnalysisOutput: { type: String }
  }],

  // 🌟 Added Appointment Scheduling array (Past, Present, Future)
  appointments: [{
    doctorName: { type: String, required: true },
    department: { type: String, required: true },
    appointmentDate: { type: Date, required: true },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
    notes: { type: String }
  }]
}, { timestamps: true });


  

// Create a geospatial index for calculating nearest distance
PatientSchema.index({ location: '2dsphere' });

// Pre-save hook to hash password before saving to database
// Pre-save hook to hash password before saving to database
// 🌟 FIX: Removed 'next' parameter completely for Mongoose 9 compatibility
PatientSchema.pre('save', async function () {
  // If password isn't modified, just exit the async function cleanly (Mongoose handles the rest)
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // 🌟 FIX: Removed next() calls! Simply returning lets Mongoose know it's done.
  } catch (error) {
    throw error; // Throwing the error passes it cleanly to your controller's catch block
  }
});

// Method to verify password during login
PatientSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Patient', PatientSchema);