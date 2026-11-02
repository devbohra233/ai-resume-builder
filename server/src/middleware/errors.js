export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err?.code === 11000) {
    return res.status(409).json({ error: 'That value is already in use.' });
  }
  if (err?.name === 'ValidationError') {
    return res.status(400).json({ error: 'Some fields are invalid. Please review and try again.' });
  }
  if (err?.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid identifier.' });
  }
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Image is too large. Maximum size is 6 MB.' });
  }
  const status = Number(err?.status) || 500;
  if (status >= 500) console.error('[api]', err);
  res.status(status).json({ error: err?.expose === false ? 'Something went wrong.' : err?.message || 'Something went wrong.' });
}
