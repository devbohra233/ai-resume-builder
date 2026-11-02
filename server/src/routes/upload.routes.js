import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { getImagekitStatus, uploadImage } from '../services/imagekit.service.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      const err = new Error('Only JPG, PNG, WEBP or GIF images are supported.');
      err.status = 415;
      return cb(err);
    }
    return cb(null, true);
  },
});

router.use(requireAuth);

router.get('/status', async (req, res) => {
  res.json({ storage: await getImagekitStatus() });
});

router.post('/avatar', upload.single('image'), async (req, res) => {
  const result = await uploadImage(req.file, { folder: 'vitae/avatars' });
  res.status(201).json(result);
});

export default router;
