import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(here, '../..');

export const paths = {
  serverRoot,
  uploads: path.join(serverRoot, 'uploads'),
  data: path.join(serverRoot, '.data'),
  clientDist: path.resolve(serverRoot, '../client/dist'),
};

export const config = {
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'vitae-insecure-dev-secret',
  mongoUri: (process.env.MONGODB_URI || '').trim(),
  isProd: process.env.NODE_ENV === 'production',
  imagekit: {
    publicKey: (process.env.IMAGEKIT_PUBLIC_KEY || '').trim(),
    privateKey: (process.env.IMAGEKIT_PRIVATE_KEY || '').trim(),
    urlEndpoint: (process.env.IMAGEKIT_URL_ENDPOINT || '').trim().replace(/\/+$/, ''),
  },
  ai: {
    apiKey: (process.env.AI_API_KEY || '').trim(),
    baseUrl: (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, ''),
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  },
  ollama: {
    url: (process.env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/+$/, ''),
    model: process.env.OLLAMA_MODEL || 'qwen2.5:1.5b',
    disabled: process.env.OLLAMA_DISABLED === 'true',
  },
};

export const imagekitEnabled = Boolean(config.imagekit.privateKey);
