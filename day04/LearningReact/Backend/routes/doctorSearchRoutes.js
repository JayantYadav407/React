const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

router.get('/search', async (req, res) => {
  try {
    const {
      q,
      city,
      hospitalType,
      hospitalName,
      specialization,
      minFee,
      maxFee,
      minExperience
    } = req.query;

    const query = {};

    if (q) {
      query.$text = { $search: q };
    }

    if (city) {
      query['clinicLocation.city'] = { $regex: city, $options: 'i' };
    }

    if (hospitalType) {
      query.hospitalType = hospitalType;
    }

    if (hospitalName) {
      query['hospital.name'] = { $regex: hospitalName, $options: 'i' };
    }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (minFee || maxFee) {
      query['fees.regular'] = {};
      if (minFee) query['fees.regular'].$gte = Number(minFee);
      if (maxFee) query['fees.regular'].$lte = Number(maxFee);
    }

    if (minExperience) {
      query.experienceYears = { $gte: Number(minExperience) };
    }

    const doctors = await Doctor.find(query)
      .select('-password')
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 });

    res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;