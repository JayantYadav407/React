const express = require('express');
const router = express.Router();

const { signupPatient, loginPatient } = require('../controllers/authController');
const { registerDoctor, loginDoctor } = require('../controllers/doctorController');

router.post('/signup', signupPatient);
router.post('/login', loginPatient);

router.post('/doctor/register', registerDoctor);
router.post('/doctor/login', loginDoctor);

module.exports = router;