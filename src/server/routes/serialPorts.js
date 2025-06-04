const express = require('express');
const router = express.Router();
const SerialPortManager = require('../serial/serial_dev.js');

router.post('/open', (req, res) => {
  var portName = String(req.body.portName);
  console.log(portName);
  try {
    if (SerialPortManager.instance !== null) {
      SerialPortManager.closePort();
      SerialPortManager.instance = null;
    }
    SerialPortManager.instance = new SerialPortManager(portName);

    res.status(200).send('Port opened successfully');
   
  } catch (error) {
    console.error('포트 연결 실패:', error.message);
    res.status(500).send('Failed to open port');
  }
});

router.post('/close', (req, res) => {
  console.log('close router test');
  var portName = String(req.body.portName);
  try {
    SerialPortManager.instance.serialPort.close();
    res.status(200).send('Port close successfully');
    // await SerialPortManager.instance.openPort();
  } catch (error) {
    console.error('포트 연결 실패:', error.message);
    res.status(500).send('Failed to open port');
  }
});

router.get('/list', async (req, res) => {
  console.log('test');
  try {
    const ports = await SerialPortManager.listPorts();
    res.status(200).json(ports);
  } catch (error) {
    res.status(500).send('Error retrieving serial ports');
  }
});

module.exports = router;
