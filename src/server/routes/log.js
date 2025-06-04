const express = require('express');
const SerialPortManager = require('../serial/serial_dev.js');

const router = express.Router();
router.use(express.json());

router.post('/read', (req, res) => {
    const serialPortManager = SerialPortManager.getInstance(); // 인스턴스 가져오기
    var cmd = String(req.body.cmd);
    const cleanCmd = cmd.replace(/\r\n/g, "");
    console.log("server log...")
    console.log(cmd);
    const dataToSend = `${cleanCmd}\r\n`;
    serialPortManager?.sendData(dataToSend);
    res.status(200).send({ data: '명령어 전송 완료...\r\n' });
})

module.exports = router;




