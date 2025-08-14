// middlewares/logging.js
const morgan = require('morgan');
const { isDev } = require('../config/env');
const { randomUUID } = require('crypto');

function logging(app) {
  // 요청 ID 부여
  app.use((req, _res, next) => {
    req.id = req.headers['x-request-id'] || randomUUID();
    next();
  });

  if (isDev) {
    morgan.token('id', req => req.id);
    app.use(morgan(':id :method :url :status :response-time ms'));
  }
}

module.exports = logging;
