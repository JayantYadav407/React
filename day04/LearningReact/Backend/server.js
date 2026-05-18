const express = require('express');
const cors = require('cors');
require('dotenv').config(); // 🌟 Kept right at the top

const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes'); // Imported cleanly here

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 

// Base test route
app.get('/', (req, res) => {
  res.send('Doctor Scheduler API is running smoothly...');
});

// 🚀 Mounting Routes (ONLY ONCE)
app.use('/api/auth', authRoutes);

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📡 Server running in production mode on port ${PORT}`);
});