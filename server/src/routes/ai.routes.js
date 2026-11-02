import express from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { Resume } from '../models/Resume.js';
import {
  analyzeATS,
  generateBullets,
  generateSummary,
  getAIStatus,
  improveText,
  suggestSkills,
} from '../services/ai.service.js';

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI is taking a breather. Try again in a minute.' },
});

router.use(requireAuth, aiLimiter);

router.get('/status', async (req, res) => {
  res.json({ ai: await getAIStatus() });
});

router.post('/summary', async (req, res) => {
  const result = await generateSummary(req.body || {});
  res.json(result);
});

router.post('/bullets', async (req, res) => {
  const result = await generateBullets(req.body || {});
  res.json(result);
});

router.post('/skills', async (req, res) => {
  const result = await suggestSkills(req.body || {});
  res.json(result);
});

router.post('/improve', async (req, res) => {
  const result = await improveText(req.body || {});
  res.json(result);
});

router.post('/ats', async (req, res) => {
  const { resume, jobDescription, resumeId } = req.body || {};
  if (!resume || typeof resume !== 'object') {
    return res.status(400).json({ error: 'Resume data is required.' });
  }
  if (!jobDescription || String(jobDescription).trim().length < 40) {
    return res.status(400).json({ error: 'Paste a job description (at least 40 characters) to analyze.' });
  }

  const result = analyzeATS(resume, jobDescription);

  if (resumeId && mongoose.isValidObjectId(resumeId)) {
    await Resume.findOneAndUpdate(
      { _id: resumeId, user: req.userId },
      { ats: { score: result.score, checkedAt: new Date() } }
    ).catch(() => {});
  }

  res.json(result);
});

export default router;
