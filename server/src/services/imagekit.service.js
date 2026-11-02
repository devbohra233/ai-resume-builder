import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import ImageKit from '@imagekit/nodejs';
import { config, imagekitEnabled, paths } from '../config/env.js';

let client = null;

function getClient() {
  if (!client) client = new ImageKit({ privateKey: config.imagekit.privateKey });
  return client;
}

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export const uploadsEnabled = true;

export async function uploadImage(file, { folder = 'vitae/avatars', transform = 'w-600,h-600,fo-face' } = {}) {
  if (!file?.buffer?.length) {
    const err = new Error('No image uploaded');
    err.status = 400;
    throw err;
  }
  if (!MIME_EXT[file.mimetype]) {
    const err = new Error('Only JPG, PNG, WEBP or GIF images are supported');
    err.status = 415;
    throw err;
  }

  if (imagekitEnabled) {
    try {
      const response = await getClient().files.upload({
        file: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        fileName: `avatar-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${MIME_EXT[file.mimetype]}`,
        folder: `/${folder}`,
        transformation: transform ? { pre: transform } : undefined,
      });
      return {
        url: response.url,
        provider: 'imagekit',
        fileId: response.fileId,
        thumbnailUrl: response.thumbnailUrl || response.url,
      };
    } catch (err) {
      console.warn('[imagekit] upload failed, falling back to local disk:', err.message);
    }
  }

  await fs.mkdir(paths.uploads, { recursive: true });
  const fileName = `avatar-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${MIME_EXT[file.mimetype]}`;
  await fs.writeFile(path.join(paths.uploads, fileName), file.buffer);
  return {
    url: `/uploads/${fileName}`,
    provider: imagekitEnabled ? 'local-fallback' : 'local',
    fileId: null,
    thumbnailUrl: `/uploads/${fileName}`,
  };
}

export async function getImagekitStatus() {
  if (!imagekitEnabled) {
    return { enabled: false, label: 'Local storage', urlEndpoint: '' };
  }
  try {
    await getClient().files.list({ limit: 1 });
    return { enabled: true, label: 'ImageKit', urlEndpoint: config.imagekit.urlEndpoint };
  } catch (err) {
    return { enabled: true, label: 'ImageKit (check keys)', urlEndpoint: config.imagekit.urlEndpoint, error: err.message };
  }
}

export function optimizeImageUrl(url) {
  if (!url || !imagekitEnabled || !url.includes('ik.imagekit.io')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}tr=w-320,h-320,fo-face`;
}
