import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { User } from '../models/User.js';

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), demo: Boolean(user.isDemo) }, config.jwtSecret, {
    expiresIn: '7d',
  });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Please sign in to continue.' });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (!mongoose.isValidObjectId(payload.sub)) throw new Error('bad subject');
    req.userId = payload.sub;
    req.isDemo = Boolean(payload.demo);
    return next();
  } catch {
    return res.status(401).json({ error: 'Your session expired. Please sign in again.' });
  }
}

export async function attachUser(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: 'Account not found.' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: 'Account not found.' });
  }
}
