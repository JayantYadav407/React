const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const doctorSearchRoutes = require('./routes/doctorSearchRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const Doctor = require('./models/Doctor.js');

const app = express();
connectDB();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/doctors', doctorSearchRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ratings', ratingRoutes);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

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
      return res.status(400).json({ error: 'Please provide symptoms (text, audio, or image).' });
    }

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemInstruction = `
You are a medical triage AI. Analyze the inputs.
Structure your response in plain text:
1. EMERGENCY CHECK
2. DETECTED SYMPTOMS
3. SUGGESTED DEPARTMENT
4. SAFE OTC SUGGESTIONS
5. DISCLAIMER
`;

    const result = await model.generateContent([systemInstruction, ...contents]);
    const response = await result.response;

    res.json({ analysis: response.text() });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ error: 'Analysis failed. Check API key and logs.' });
  }
});

app.get('/', (req, res) => {
  res.send('HEIRS Healthcare API is active and running.');
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📡 Server running on http://localhost:${PORT}`);
});