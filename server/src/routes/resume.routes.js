import express from 'express';
import mongoose from 'mongoose';
import { Resume } from '../models/Resume.js';
import { attachUser, requireAuth } from '../middleware/auth.js';
import { makeSlug, normalizeResume } from '../utils/normalize.js';
import { blankResume, sampleResume } from '../utils/resumeData.js';

const router = express.Router();
router.use(requireAuth);

const TEMPLATES = ['minimal', 'modern', 'compact'];

function findOwned(userId, id) {
  if (!mongoose.isValidObjectId(id)) return Promise.resolve(null);
  return Resume.findOne({ _id: id, user: userId });
}

router.get('/', async (req, res) => {
  const resumes = await Resume.find({ user: req.userId }).sort({ lastEditedAt: -1, updatedAt: -1 });
  res.json({ resumes: resumes.map((r) => r.toJSON()) });
});

router.post('/', attachUser, async (req, res) => {
  const { sample = false, title, template, accent } = req.body || {};
  const base = sample === true || sample === 'true' ? sampleResume() : blankResume();
  if (typeof title === 'string' && title.trim()) base.title = title.trim().slice(0, 120);
  else if (!sample) base.title = 'Untitled resume';
  if (TEMPLATES.includes(template)) base.template = template;
  if (/^#[0-9a-fA-F]{6}$/.test(accent || '')) base.accent = accent;

  if (!sample) {
    base.personal.fullName = req.user.name || '';
    base.personal.email = req.user.email || '';
  }

  const resume = await Resume.create({ user: req.userId, ...base });
  res.status(201).json({ resume: resume.toJSON() });
});

router.get('/:id', async (req, res) => {
  const resume = await findOwned(req.userId, req.params.id);
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });
  res.json({ resume: resume.toJSON() });
});

router.put('/:id', async (req, res) => {
  const resume = await findOwned(req.userId, req.params.id);
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });

  const data = normalizeResume(req.body);
  resume.title = data.title;
  resume.template = data.template;
  resume.accent = data.accent;
  resume.personal = data.personal;
  resume.experience = data.experience;
  resume.education = data.education;
  resume.projects = data.projects;
  resume.skills = data.skills;
  resume.certifications = data.certifications;
  resume.languages = data.languages;
  resume.lastEditedAt = new Date();
  await resume.save();
  res.json({ resume: resume.toJSON() });
});

router.patch('/:id', async (req, res) => {
  const resume = await findOwned(req.userId, req.params.id);
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });

  const { title, template, accent } = req.body || {};
  if (typeof title === 'string' && title.trim()) resume.title = title.trim().slice(0, 120);
  if (TEMPLATES.includes(template)) resume.template = template;
  if (/^#[0-9a-fA-F]{6}$/.test(accent || '')) resume.accent = accent;
  await resume.save();
  res.json({ resume: resume.toJSON() });
});

router.post('/:id/duplicate', async (req, res) => {
  const source = await findOwned(req.userId, req.params.id);
  if (!source) return res.status(404).json({ error: 'Resume not found.' });

  const data = source.toObject();
  delete data._id;
  delete data.__v;
  delete data.createdAt;
  delete data.updatedAt;
  delete data.slug;
  delete data.views;
  data.user = req.userId;
  data.title = `${source.title} (copy)`.slice(0, 120);
  data.visibility = 'private';
  data.slug = undefined;
  data.views = 0;
  data.ats = { score: source.ats?.score ?? null, checkedAt: source.ats?.checkedAt ?? null };
  data.lastEditedAt = new Date();

  const copy = await Resume.create(data);
  res.status(201).json({ resume: copy.toJSON() });
});

router.post('/:id/publish', async (req, res) => {
  const resume = await findOwned(req.userId, req.params.id);
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });

  if (!resume.slug) {
    let slug = makeSlug(resume.personal?.fullName || resume.title);
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const clash = await Resume.exists({ slug });
      if (!clash) break;
      slug = makeSlug(resume.personal?.fullName || resume.title);
    }
    resume.slug = slug;
  }
  resume.visibility = 'public';
  await resume.save();
  res.json({ resume: resume.toJSON() });
});

router.post('/:id/unpublish', async (req, res) => {
  const resume = await findOwned(req.userId, req.params.id);
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });
  resume.visibility = 'private';
  await resume.save();
  res.json({ resume: resume.toJSON() });
});

router.delete('/:id', async (req, res) => {
  const resume = await findOwned(req.userId, req.params.id);
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });
  await resume.deleteOne();
  res.json({ ok: true });
});

export default router;
