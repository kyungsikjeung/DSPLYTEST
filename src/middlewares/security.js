// middlewares/security.js
const cors = require('cors');
const helmet = require('helmet');
const { isDev, PORT, CORS_ORIGINS } = require('../config/env');

function buildCspDirectives() {
  const directives = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:'],
    fontSrc: ["'self'"],
    connectSrc: ["'self'"],
    objectSrc: ["'none'"],
  };

  if (isDev) {
    const devs = ['http://localhost:3000', `http://localhost:${PORT}`, 'ws://localhost:3000'];
    directives.scriptSrc.push(...devs.slice(0, 2));
    directives.imgSrc.push(...devs.slice(0, 2));
    directives.fontSrc.push(...devs.slice(0, 2));
    directives.connectSrc.push(...devs);
  }
  return directives;
}

function security(app) {
  // 프록시 환경에서 IP/HTTPS 신뢰
  app.set('trust proxy', 1);

  // Helmet 기본 보호
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false, // 개발/이미지 처리 시 충돌 방지
    })
  );
  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: false,
      directives: buildCspDirectives(),
    })
  );

  // CORS 화이트리스트
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true); // 서버-서버/로컬 툴 허용
        if (CORS_ORIGINS.length === 0 && isDev) {
          const devs = ['http://localhost:3000', `http://localhost:${PORT}`];
          if (devs.includes(origin)) return cb(null, true);
        }
        if (CORS_ORIGINS.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS: Origin not allowed - ${origin}`));
      },
      credentials: true,
    })
  );
}

module.exports = security;
