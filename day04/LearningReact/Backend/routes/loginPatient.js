exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 2. Compare hashed password
    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 3. Send Token
    const token = generateToken(patient._id);
    res.status(200).json({
      success: true,
      token,
      patient: { id: patient._id, name: patient.name, email: patient.email }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};