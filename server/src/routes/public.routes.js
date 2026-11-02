import express from 'express';
import { Resume } from '../models/Resume.js';

const router = express.Router();

router.get('/resumes/:slug', async (req, res) => {
  const resume = await Resume.findOneAndUpdate(
    { slug: req.params.slug, visibility: 'public' },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('user', 'name headline avatarUrl');

  if (!resume) return res.status(404).json({ error: 'This resume is private or no longer available.' });

  const data = resume.toJSON();
  data.owner = {
    name: resume.user?.name || data.personal?.fullName || '',
    headline: resume.user?.headline || '',
    avatarUrl: resume.user?.avatarUrl || '',
  };
  delete data.ats;
  res.json({ resume: data });
});

export default router;
