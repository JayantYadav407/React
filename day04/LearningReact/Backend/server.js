const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
// ... rest of your code

const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes'); 
const Doctor = require('./models/Doctor.js'); // your mongoose model

const app = express();
connectDB();





app.get('/:id', async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// 1. Initialize App & Database

// 2. Initialize Gemini AI
// Ensure GEMINI_API_KEY is defined in your .env file
// Correct way: Explicitly providing the key
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

// 3. Configure File Uploads (Multer)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// 4. Global Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite Frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Handle large payloads for base64 or heavy JSON
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 5. API Routes

/**
 * AUTH ROUTES
 * Handles: 
 * - POST /api/auth/login
 * - POST /api/auth/register (Patients)
 * - POST /api/auth/doctor/register (Doctors)
 */
app.use('/api/auth', authRoutes);

/**
 * USER ROUTES
 * Handles:
 * - GET /api/user/profile
 * - PUT /api/user/update
 */
app.use('/api/user', userRoutes);

/**
 * SYMPTOM ANALYSIS (Gemini Multi-Modal)
 * Handles image, audio, and text input for medical triage
 */
app.post('/api/analyze-symptoms', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const { textSymptoms } = req.body;
    const contents = [];

    if (textSymptoms) {
      contents.push({ text: `User written symptoms: ${textSymptoms}` });
    }

    if (req.files && req.files['image']) {
      const imgFile = req.files['image'][0];
      contents.push({
        inlineData: {
          mimeType: imgFile.mimetype,
          data: imgFile.buffer.toString('base64')
        }
      });
    }

    if (req.files && req.files['audio']) {
      const audioFile = req.files['audio'][0];
      contents.push({
        inlineData: {
          mimeType: audioFile.mimetype,
          data: audioFile.buffer.toString('base64')
        }
      });
    }

    if (contents.length === 0) {
      return res.status(400).json({ error: "Please provide symptoms (text, audio, or image)." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemInstruction = `
      You are a medical triage AI. Analyze the inputs. 
      Structure your response in plain text:
      1. EMERGENCY CHECK: Boldly state if immediate hospital visit is needed.
      2. DETECTED SYMPTOMS: Summary of what you found.
      3. SUGGESTED DEPARTMENT: Specialist to visit.
      4. SAFE OTC SUGGESTIONS: Comfort measures only.
      5. DISCLAIMER: State you are an AI, not a doctor.
    `;

    const result = await model.generateContent([systemInstruction, ...contents]);
    const response = await result.response;
    
    res.json({ analysis: response.text() });

  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: "Analysis failed. Check API key and logs." });
  }
});

// 6. Health Check & Root
app.get('/', (req, res) => {
  res.send('HEIRS Healthcare API is active and running.');
});

// 7. Error Handling Middleware (Catch-all)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 8. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📡 Server running on http://localhost:${PORT}`);
});