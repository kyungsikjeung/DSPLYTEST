// routes/serial.js
const express = require('express');
const router = express.Router();

// 기존 라우터 모듈을 감싸 명확한 파일명으로 분리
const serialPortsRouter = require('../routes/serialPorts.js');
router.use('/', serialPortsRouter);

module.exports = router;
