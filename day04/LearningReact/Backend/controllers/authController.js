const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.signupPatient = async (req, res) => {
  try {
    const { name, email, password, phone, age, gender, bloodGroup, physicalAddress, medicalHistory } = req.body;

    // 1. Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // 2. Convert Physical Address to Geo-Coordinates (Mock Geocoding Logic)
    const mockLongitude = 80.3319; // Example Kanpur Coordinates
    const mockLatitude = 26.4499;

    // 3. Create new patient profile
    const newPatient = await Patient.create({
      name,
      email,
      password, // Note: Ensure you use bcrypt in your Patient model pre-save hook to hash this!
      phone,
      age,
      gender,
      bloodGroup,
      physicalAddress,
      location: {
        type: 'Point',
        coordinates: [mockLongitude, mockLatitude] 
      },
      medicalHistory
    });

    // 4. Respond with Token
    const token = generateToken(newPatient._id);
    res.status(201).json({
      success: true,
      token,
      patient: { id: newPatient._id, name: newPatient.name, email: newPatient.email }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};

// 🌟 ADD THIS NEW LOGIN FUNCTION HERE TO FIX THE CRASH
exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find patient by email (include lowercase transformation to match signup)
    const patient = await Patient.findOne({ email: email.toLowerCase() });
    if (!patient) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. Use the model's comparePassword method to decrypt and verify
    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. Generate token and respond
    const token = generateToken(patient._id);
    res.status(200).json({
      success: true,
      token,
      patient: { 
        id: patient._id, 
        name: patient.name, 
        email: patient.email,
        avatarUrl:patient.avatarUrl,

      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};