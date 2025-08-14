// server app.js
const express = require('express');
const compression = require('compression');
const security = require('./middlewares/security');
const logging = require('./middlewares/logging');
const { notFound, errorHandler } = require('./middlewares/errors');

const app = express();

// 성능: gzip/deflate
app.use(compression());

// 파서
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 보안/로깅
security(app);
logging(app);

// 라우트
app.use('/', require('./routes/index'));          // /healthz, /readyz, /livez
app.use('/api/serial', require('./routes/serial'));// 기존 /api/serial

// 404 & 에러
app.use(notFound);
app.use(errorHandler);

module.exports = app;
