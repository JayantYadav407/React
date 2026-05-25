const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    default: ''
  },
  dob: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  bloodGroup: {
    type: String,
    default: 'O+'
  },
  physicalAddress: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
  },
  medicalHistory: {
    chronicIllnesses: [{
      type: String
    }],
    allergies: [{
      type: String
    }],
    pastSurgeries: [{
      type: String
    }],
    currentMedications: [{
      type: String
    }]
  },
  appointments: [{
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    doctorName: {
      type: String,
      default: 'Unknown Doctor'
    },
    department: {
      type: String,
      default: 'General'
    },
    specialty: {
      type: String,
      default: 'General'
    },
    appointmentDate: {
      type: Date
    },
    status: {
      type: String,
      default: 'Scheduled',
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Pending']
    },
    notes: {
      type: String,
      default: ''
    }
  }],
  symptomHistory: [{
    symptoms: [{
      type: String
    }],
    severity: {
      type: Number,
      min: 1,
      max: 10
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

patientSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

patientSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

patientSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Patient', patientSchema);