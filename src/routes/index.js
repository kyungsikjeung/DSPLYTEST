// routes/index.js
const express = require('express');
const router = express.Router();
const { NODE_ENV } = require('../config/env');

router.get('/healthz', (_req, res) => {
  res.json({ ok: true, env: NODE_ENV });
});

// readiness / livez 훅 (필요 시 실제 종속성 체크 로직 연결)
router.get('/readyz', (_req, res) => res.json({ ready: true }));
router.get('/livez', (_req, res) => res.json({ live: true }));

module.exports = router;
