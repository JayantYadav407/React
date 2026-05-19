const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerDoctor = async (req, res) => {
  try {
    const { 
      fullName, email, password, specialization, 
      proficiency, hospitalName, city, regularFee, emergencyFee 
    } = req.body;

    // Check if doctor exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create doctor
    const newDoctor = new Doctor({
      fullName,
      email,
      password: hashedPassword,
      specialization,
      proficiency,
      hospital: { name: hospitalName, city: city },
      fees: { regular: regularFee, emergency: emergencyFee },
      role: 'doctor'
    });

    await newDoctor.save();

    // Generate Token
    const token = jwt.sign({ id: newDoctor._id, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token, doctor: newDoctor, role: 'doctor' });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};