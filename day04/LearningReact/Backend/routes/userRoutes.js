const fs = require('fs');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});


const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});


// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};


// POST /api/user/register - Register patient
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;


    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }


    const patientExists = await Patient.findOne({ email });


    if (patientExists) {
      return res.status(400).json({ message: 'Patient already exists' });
    }


    const patient = await Patient.create({
      name,
      email,
      password,
      phone: phone || ''
    });


    if (patient) {
      res.status(201).json({
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        token: generateToken(patient._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid patient data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// POST /api/user/login - Login patient
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }


    const patient = await Patient.findOne({ email }).select('+password');


    if (!patient) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }


    if (patient.isDeleted === true) {
      return res.status(403).json({ 
        message: 'This account has been deleted. Please contact support to reactivate.' 
      });
    }


    const isMatch = await bcrypt.compare(password, patient.password);


    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }


    res.json({
      _id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      token: generateToken(patient._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET /api/user/profile - Get patient profile
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }


    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    const patient = await Patient.findById(decoded.id).select('-password');


    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }


    if (patient.isDeleted === true) {
      return res.status(403).json({ 
        message: 'This account has been deleted' 
      });
    }


    // ✅ Return full avatar URL
    const avatarUrl = patient.avatarUrl 
      ? `http://localhost:5000${patient.avatarUrl}` 
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';


    res.json({ 
      patient: {
        ...patient.toObject(),
        avatarUrl: avatarUrl
      } 
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token expired' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});


// PUT /api/user/profile/update - Update patient profile
router.put('/profile/update', upload.single('avatar'), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }


    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    const patient = await Patient.findById(decoded.id);


    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }


    if (req.body.phone) patient.phone = req.body.phone;
    if (req.body.dob) patient.dob = req.body.dob;
    if (req.body.bloodGroup) patient.bloodGroup = req.body.bloodGroup;
    if (req.body.physicalAddress) patient.physicalAddress = req.body.physicalAddress;


    if (req.body.chronicIllnesses) {
      patient.medicalHistory.chronicIllnesses = req.body.chronicIllnesses
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');
    }
    if (req.body.allergies) {
      patient.medicalHistory.allergies = req.body.allergies
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');
    }
    if (req.body.pastSurgeries) {
      patient.medicalHistory.pastSurgeries = req.body.pastSurgeries
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');
    }
    if (req.body.currentMedications) {
      patient.medicalHistory.currentMedications = req.body.currentMedications
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');
    }


    // ✅ Save file path to database
    if (req.file) {
      patient.avatarUrl = `/uploads/${req.file.filename}`;
    }


    const updatedPatient = await patient.save();


    // ✅ Return full avatar URL to frontend
    const avatarUrl = updatedPatient.avatarUrl 
      ? `http://localhost:5000${updatedPatient.avatarUrl}` 
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';


    res.json({ 
      patient: {
        ...updatedPatient.toObject(),
        avatarUrl: avatarUrl
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// DELETE /api/user/profile - Soft delete patient account
router.delete('/profile', async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/user/profile - Request received');
    
    const authHeader = req.headers.authorization;
    console.log('🔑 Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid token');
      return res.status(401).json({ message: 'No token provided' });
    }


    const token = authHeader.split(' ')[1];
    console.log('🔑 Token extracted:', token.substring(0, 20) + '...');


    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token decoded:', decoded);
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }


    console.log('🔍 Looking for patient with ID:', decoded.id);
    const patient = await Patient.findById(decoded.id);


    if (!patient) {
      console.log('❌ Patient not found:', decoded.id);
      return res.status(404).json({ message: 'Patient not found' });
    }


    console.log('✅ Patient found:', patient.name, patient.email);
    console.log('📝 Starting soft delete...');


    patient.isDeleted = true;
    patient.deletedAt = new Date();
    patient.phone = '';
    patient.dob = null;
    patient.physicalAddress = '';
    patient.avatarUrl = '';
    patient.medicalHistory = {
      chronicIllnesses: [],
      allergies: [],
      pastSurgeries: [],
      currentMedications: []
    };
    
    console.log('📝 Cancelling appointments...');
    await Appointment.updateMany(
      { 
        userId: patient._id,
        status: { $in: ['Pending', 'Accepted', 'Scheduled'] }
      },
      { 
        status: 'Cancelled',
        notes: 'Account deleted'
      }
    );


    console.log('📝 Saving patient with isDeleted=true...');
    await patient.save();


    console.log('✅ Patient account soft deleted successfully:', patient.email);


    res.json({ 
      success: true,
      message: 'Account deleted successfully. Your name and email have been preserved.',
      patient: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        isDeleted: true
      }
    });
  } catch (error) {
    console.error('❌ DELETE /api/user/profile - Error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


module.exports = router;