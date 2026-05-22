const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.registerDoctor = async (req, res) => {
  try {
    const { email, password, fullName, ...otherDetails } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'fullName, email and password are required' });
    }

    const existingDoctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newDoctor = await Doctor.create({
      ...otherDetails,
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'doctor'
    });

    const doctorData = newDoctor.toObject();
    delete doctorData.password;

    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully',
      doctor: doctorData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (!doctor) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(doctor._id);

    const doctorData = doctor.toObject();
    delete doctorData.password;

    res.status(200).json({
      success: true,
      token,
      doctorId: doctor._id,
      user: {
        ...doctorData,
        id: doctor._id,
        role: 'doctor'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};