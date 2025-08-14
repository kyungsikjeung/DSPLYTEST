// middlewares/errors.js
const { isDev } = require('../config/env');

function notFound(_req, res, _next) {
  res.status(404).json({ error: 'Not Found' });
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  if (isDev) {
    // eslint-disable-next-line no-console
    console.error('Error:', err);
  }
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(isDev ? { stack: err.stack } : {}),
  });
}

module.exports = { notFound, errorHandler };
