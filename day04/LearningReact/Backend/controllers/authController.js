const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.signupPatient = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      age,
      gender,
      bloodGroup,
      physicalAddress,
      medicalHistory
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingPatient = await Patient.findOne({ email: cleanEmail });
    if (existingPatient) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newPatient = await Patient.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone,
      age,
      gender,
      bloodGroup,
      physicalAddress,
      location: {
        type: 'Point',
        coordinates: [80.3319, 26.4499]
      },
      medicalHistory
    });

    const token = generateToken(newPatient._id);

    res.status(201).json({
      success: true,
      token,
      patient: {
        id: newPatient._id,
        name: newPatient.name,
        email: newPatient.email,
        avatarUrl: newPatient.avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};

exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const patient = await Patient.findOne({ email: cleanEmail });
    if (!patient) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(patient._id);

    res.status(200).json({
      success: true,
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        avatarUrl: patient.avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};