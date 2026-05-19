import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // Keep files in memory for fast API transfer

// Initialize Gemini SDK (Make sure GEMINI_API_KEY is in your .env file)
const ai = new GoogleGenAI({});

app.use(express.json());
app.use(express.static('public')); // Serves your frontend page

app.post('/api/analyze-symptoms', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), async (req, res) => {
    try {
        const { textSymptoms } = req.body;
        const contents = [];

        // 1. Add Text Symptoms if present
        if (textSymptoms) {
            contents.push(`User written symptoms: ${textSymptoms}`);
        }

        // 2. Add Image if uploaded
        if (req.files['image']) {
            const imgFile = req.files['image'][0];
            contents.push({
                inlineData: {
                    mimeType: imgFile.mimetype,
                    data: imgFile.buffer.toString('base64')
                }
            });
        }

        // 3. Add Audio Voice Command if uploaded
        if (req.files['audio']) {
            const audioFile = req.files['audio'][0];
            contents.push({
                inlineData: {
                    mimeType: audioFile.mimetype,
                    data: audioFile.buffer.toString('base64')
                }
            });
        }

        if (contents.length === 0) {
            return res.status(400).json({ error: "Please provide at least one input (text, voice, or image)." });
        }

        // System instructions to enforce safe, structured medical triage formatting
        const systemInstruction = `
            You are an expert medical triage AI. Analyze the provided multi-modal inputs (text description, voice audio note, and/or image of symptoms). 
            
            Provide a strictly structured response in plain text (no markdown formatting like asterisks or hashtags) covering:
            1. EMERGENCY CHECK: If symptoms indicate an immediate life-threatening emergency (e.g., severe chest pain, stroke signs), explicitly state "EMERGENCY: Proceed to the nearest hospital immediately" at the very top.
            2. DETECTED SYMPTOMS: List the key symptoms identified.
            3. SUGGESTED MEDICAL DEPARTMENT: Specify the exact medical department or type of doctor specialist they should consult.
            4. SAFE OTC SUGGESTIONS: Suggest only safe, temporary, over-the-counter (OTC) comfort measures or medications. NEVER suggest prescription drugs.
            5. MEDICAL DISCLAIMER: Include a mandatory statement that you are an AI, not a doctor, and this is for informational triage only.
        `;

        // Call Gemini 3 Flash to process all modalities at once
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3, // Lower temperature for more consistent, factual medical mapping
            }
        });

        res.json({ analysis: response.text });

    } catch (error) {
        console.error("Error processing symptoms:", error);
        res.status(500).json({ error: "Failed to analyze symptoms. Please try again." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Medical Triage Server running on port ${PORT}`));