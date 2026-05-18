const express = require('express');
// Explicitly create the router instance
const router = express.Router();

const { signupPatient, loginPatient } = require('../controllers/authController');

// Define your endpoints clearly
router.post('/signup', signupPatient);
router.post('/login', loginPatient);

// Double-check that you are exporting the router object itself!
module.exports = router;