require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';
const PORT = Number(process.env.PORT || 5000);


// 쉼표 구분 오리진
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

module.exports = {
  NODE_ENV,
  isProd,
  isDev: !isProd,
  PORT,
  CORS_ORIGINS,
};
