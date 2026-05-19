const express = require('express');
const router = express.Router();
const { signupPatient, loginPatient } = require('../controllers/authController');
const { registerDoctor } = require('../controllers/doctorController'); // 👈 Import new controller

// Patient Endpoints
router.post('/signup', signupPatient);
router.post('/login', loginPatient);

// Doctor Endpoint
router.post('/doctor/register', registerDoctor); // 👈 Added this

module.exports = router;