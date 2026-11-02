import fs from 'node:fs';
import mongoose from 'mongoose';
import { config, paths } from './env.js';

let memoryServer = null;
let mode = 'unknown';

export async function connectDB() {
  if (config.mongoUri) {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
    mode = 'external';
  } else {
    // Zero-config local database: a real mongod process persisted to disk.
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbPath = `${paths.data}/mongo`;
    fs.mkdirSync(dbPath, { recursive: true });
    memoryServer = await MongoMemoryServer.create({
      instance: { dbPath, storageEngine: 'wiredTiger' },
      binary: { version: process.env.MONGOMS_VERSION || '7.0.14' },
    });
    await mongoose.connect(memoryServer.getUri(), { dbName: 'vitae' });
    mode = 'memory';
  }

  mongoose.connection.on('error', (err) => console.error('[db] connection error:', err.message));
  console.log(`[db] connected (${mode}) -> ${mongoose.connection.host}/${mongoose.connection.name}`);
  return mode;
}

export function dbMode() {
  return mode;
}

export async function closeDB() {
  await mongoose.disconnect().catch(() => {});
  if (memoryServer) await memoryServer.stop().catch(() => {});
}
