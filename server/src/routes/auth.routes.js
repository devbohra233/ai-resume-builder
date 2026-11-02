import express from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { blankResume, sampleResume } from '../utils/resumeData.js';
import { attachUser, requireAuth, signToken } from '../middleware/auth.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
});

const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function validateCredentials({ email, password }) {
  if (!email || !emailRe.test(email)) return 'Enter a valid email address.';
  if (!password || password.length < 8) return 'Password must be at least 8 characters.';
  return null;
}

async function createStarterResume(user) {
  const base = blankResume({ title: 'My first resume' });
  base.personal.fullName = user.name;
  base.personal.email = user.email;
  return Resume.create({ user: user._id, ...base });
}

router.post('/register', authLimiter, async (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 80);
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!name) return res.status(400).json({ error: 'Please tell us your name.' });
  const invalid = validateCredentials({ email, password });
  if (invalid) return res.status(400).json({ error: invalid });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  await createStarterResume(user);

  res.status(201).json({ token: signToken(user), user: user.toSafe() });
});

router.post('/login', authLimiter, async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) return res.status(401).json({ error: 'Email or password is incorrect.' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Email or password is incorrect.' });

  user.lastLoginAt = new Date();
  await user.save();
  res.json({ token: signToken(user), user: user.toSafe() });
});

router.post('/demo', authLimiter, async (req, res) => {
  const suffix = Math.random().toString(36).slice(2, 9);
  const passwordHash = await bcrypt.hash(`demo-${suffix}-${Date.now()}`, 10);
  const user = await User.create({
    name: 'Jordan Ellis',
    email: `demo-${suffix}@vitae.app`,
    passwordHash,
    isDemo: true,
    headline: 'Senior Product Engineer',
  });
  const sample = sampleResume();
  await Resume.create({ user: user._id, ...sample, title: 'Senior Product Engineer — Sample' });
  res.status(201).json({ token: signToken(user), user: user.toSafe() });
});

router.get('/me', requireAuth, attachUser, (req, res) => {
  res.json({ user: req.user.toSafe() });
});

router.patch('/me', requireAuth, attachUser, async (req, res) => {
  const { name, headline, avatarUrl } = req.body || {};
  if (typeof name === 'string' && name.trim()) req.user.name = name.trim().slice(0, 80);
  if (typeof headline === 'string') req.user.headline = headline.trim().slice(0, 120);
  if (typeof avatarUrl === 'string') req.user.avatarUrl = avatarUrl.trim().slice(0, 600);
  await req.user.save();
  res.json({ user: req.user.toSafe() });
});

export default router;
