const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const { HfInference } = require('@huggingface/inference');
const Doctor = require('../models/Doctor');

const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

const normalizeText = (txt = '') =>
  String(txt)
    .replace(/["'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const toFlatVector = (embedding) => {
  if (!embedding) return null;
  if (Array.isArray(embedding) && typeof embedding[0] === 'number') return embedding;
  if (Array.isArray(embedding) && Array.isArray(embedding[0])) return embedding[0];
  return null;
};

router.get('/search', async (req, res) => {
  try {
    const {
      q = '',
      city = '',
      hospitalType = '',
      hospitalName = '',
      specialization = '',
      minFee = '',
      maxFee = '',
      minExperience = ''
    } = req.query;

    const query = {};
    if (q.trim()) {
      query.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { specialization: { $regex: q, $options: 'i' } },
        { proficiency: { $regex: q, $options: 'i' } },
        { 'skills': { $regex: q, $options: 'i' } },
        { 'conditionsTreated': { $regex: q, $options: 'i' } },
        { 'services': { $regex: q, $options: 'i' } }
      ];
    }

    if (city.trim()) query['clinicLocation.city'] = { $regex: city, $options: 'i' };
    if (hospitalType.trim()) query.hospitalType = hospitalType;
    if (hospitalName.trim()) query['hospital.name'] = { $regex: hospitalName, $options: 'i' };
    if (specialization.trim()) query.specialization = { $regex: specialization, $options: 'i' };

    if (minExperience !== '' || maxFee !== '' || minFee !== '') {
      query.fees = query.fees || {};
    }
    if (minFee !== '') query['fees.regular'] = { ...(query['fees.regular'] || {}), $gte: Number(minFee) };
    if (maxFee !== '') query['fees.regular'] = { ...(query['fees.regular'] || {}), $lte: Number(maxFee) };
    if (minExperience !== '') query.experienceYears = { $gte: Number(minExperience) };

    const doctors = await Doctor.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Doctor search error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Search failed'
    });
  }
});

router.post('/ai-search', async (req, res) => {
  try {
    const { symptom = '' } = req.body;

    if (!symptom.trim()) {
      return res.status(400).json({ success: false, message: 'symptom is required' });
    }

    const correction = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Fix the spelling and medical intent of: "${symptom}". Return only the corrected term.`
        }
      ],
      temperature: 0
    });

    const cleanedSymptom = normalizeText(correction?.choices?.[0]?.message?.content || symptom);

    const rawEmbedding = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: cleanedSymptom
    });

    const queryVector = toFlatVector(rawEmbedding);

    if (!queryVector || queryVector.length !== 384) {
      return res.status(500).json({
        success: false,
        message: 'Embedding generation failed or dimension mismatch'
      });
    }

    const candidateDoctors = await Doctor.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector,
          numCandidates: 100,
          limit: 10
        }
      },
      {
        $project: {
          fullName: 1,
          specialization: 1,
          proficiency: 1,
          skills: 1,
          conditionsTreated: 1,
          services: 1,
          credentials: 1,
          experienceYears: 1,
          fees: 1,
          clinicLocation: 1,
          hospital: 1,
          hospitalType: 1,
          profileImage: 1,
          ratingSummary: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ]);

    if (!candidateDoctors.length) {
      return res.json({
        success: true,
        correctedQuery: cleanedSymptom,
        doctors: []
      });
    }

    const rerankPrompt = `
You are a doctor search ranking assistant.

Patient query:
"${cleanedSymptom}"

Candidate doctors:
${JSON.stringify(candidateDoctors, null, 2)}

Task:
Rank the doctors by relevance to the patient query.

Consider:
- specialization match
- condition/symptom match
- services match
- city/location match
- experience and credentials
- fees if relevant

Return only valid JSON in this exact format:
{
  "results": [
    {
      "doctorId": "string",
      "score": number,
      "reason": "short reason"
    }
  ]
}

Rules:
- score must be from 0 to 100
- sort results from highest score to lowest score
- do not invent any doctor data
- do not include any extra text
`;

    const rerankRes = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: rerankPrompt }],
      temperature: 0
    });

    const rawContent = rerankRes?.choices?.[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = { results: [] };
    }

    const scoreMap = new Map();
    (parsed.results || []).forEach(item => {
      if (item?.doctorId) scoreMap.set(String(item.doctorId), item);
    });

    const rankedDoctors = candidateDoctors
      .map(doc => {
        const rerank = scoreMap.get(String(doc._id)) || {};
        return {
          ...doc,
          rerankScore: rerank.score ?? 0,
          rerankReason: rerank.reason || ''
        };
      })
      .sort((a, b) => b.rerankScore - a.rerankScore);

    return res.json({
      success: true,
      correctedQuery: cleanedSymptom,
      doctors: rankedDoctors
    });
  } catch (error) {
    console.error('Search Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'AI search failed'
    });
  }
});

module.exports = router;