import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { closeDB, connectDB, dbMode } from './config/db.js';
import { config, imagekitEnabled, paths } from './config/env.js';
import { errorHandler, notFound } from './middleware/errors.js';
import aiRoutes from './routes/ai.routes.js';
import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import { getAIStatus } from './services/ai.service.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));

fs.mkdirSync(paths.uploads, { recursive: true });
app.use('/uploads', express.static(paths.uploads, { maxAge: '7d', index: false }));

app.get('/api/health', async (req, res) => {
  res.json({
    ok: true,
    db: dbMode(),
    ai: await getAIStatus(),
    imagekit: imagekitEnabled,
    uptime: Math.round(process.uptime()),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/public', publicRoutes);
app.use('/api', notFound);

const indexHtml = path.join(paths.clientDist, 'index.html');
if (fs.existsSync(indexHtml)) {
  app.use(express.static(paths.clientDist, { maxAge: '1h', index: false }));
  app.use((req, res, next) => {
    if (req.method === 'GET' && req.accepts('html')) return res.sendFile(indexHtml);
    return next();
  });
}

app.use(notFound);
app.use(errorHandler);

async function main() {
  if (config.isProd && !(process.env.JWT_SECRET || '').trim()) {
    console.warn('[security] NODE_ENV=production but JWT_SECRET is not set — using an insecure default.');
  }
  if (config.isProd && !config.mongoUri) {
    console.warn('[db] MONGODB_URI is not set; using the bundled local MongoDB. Data will not survive redeploys.');
  }
  const mode = await connectDB();
  const server = app.listen(config.port, () => {
    const ai = getAIStatus();
    console.log(`\n  Vitae API ready on http://localhost:${config.port}`);
    console.log(`  database : ${mode}${mode === 'memory' ? ' (persistent local mongod)' : ''}`);
    console.log(`  imagekit : ${imagekitEnabled ? 'connected' : 'local disk fallback'}`);
    ai.then((s) => console.log(`  ai       : ${s.label} · ${s.model}`)).catch(() => {});
    if (fs.existsSync(indexHtml)) console.log('  client   : serving production build from client/dist');
    else console.log(`  client   : dev server expected at ${config.clientUrl}`);
    console.log('');
  });

  const shutdown = async (signal) => {
    console.log(`\n[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await closeDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 8000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
