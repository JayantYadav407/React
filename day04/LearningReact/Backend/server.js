const express = require('express');
const cors = require('cors');
require('dotenv').config(); // 🌟 Kept right at the top

const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes'); // 🌟 1. Import the new profile routes

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend address
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json()); 

// Base test route
app.get('/', (req, res) => {
  res.send('Doctor Scheduler API is running smoothly...');
});

// 🚀 Mounting Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // 🌟 2. Mount user profile endpoints under /api/user




// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📡 Server running in production mode on port ${PORT}`);
});