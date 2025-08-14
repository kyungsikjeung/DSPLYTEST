const express = require('express');
const router = express.Router();

const {SerialPortManager} = require('../services/serial/serialdriver.js');
const {getRawData,readTextWriteExcel,deleteFile} = require('../services/logs/log.js');

router.get('/list', async (req, res) => {
  try {
    const ports = await SerialPortManager.listPorts(); // SerialPort.list()
    const portNames = ports.map(port => port.path);
    res.status(200).json(portNames);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// has CA410
router.get('/hasCA410', async (req, res) => {
  try {
    const ports = await SerialPortManager.listPorts(); // SerialPort.list()
    const filteredPorts = ports.filter(row => row.manufacturer === 'KONICA MINOLTA, INC.');

    let hasCA410 = false;
    hasCA410 = filteredPorts.length > 0 ? true :  false;
    res.status(200).json({ hasCA410 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




/* Serial Port Connect */
/**
 * @description the router.get('/connect') callback method
 *
 * @function router.get('/connect') callback
 * @signature async (req, res) => {
 * @modifiers async
 *
 * @params:
 *   - req, res
 * @returns {Type} - void
 *
 * @file src/routes/serialPorts.js
 * @date 8/13/2025
 * @author ksjeung, tovis
 * @version 1.0.0
 * @license BSD-3-Clause
 */
router.get('/connect', async (req, res) => {
  try {
    const ports = await SerialPortManager.listPorts(); // SerialPort.list()
    const filteredPorts = ports.filter(row => row.manufacturer === 'KONICA MINOLTA, INC.');
    // console.log("연결 시도:", JSON.stringify(filteredPorts));
    if (filteredPorts.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No matching serial port found',
        portList: ports.map(p => p.path),
        selectedPort: null
      });
    }
    const selectedPort = filteredPorts[0].path;
    const serialPortManager = SerialPortManager.getInstance(selectedPort, 38400);
    await serialPortManager.openPort();

    /* Data Init */
    const luminanceOnlyCommands = [
    "COM,1\n",    // 통신 시작
    "SCS,4,60.00\n",    // 측정 속도: FAST
    "FSC,1\n",    // 측정 속도: FAST
    "OPR,1\n",    // 프로브 선택: P1
    "MMS,2\n",    // 측정 모드: 휘도(Lv)만 측정
    "MDS,2\n",    // 표시 모드: Lv only
    "MCH,0\n",    // 캘리브레이션 채널 설정
    "LUS,1\n",    // 단위: cd/m²
    "ZRC\n",      // 제로 캘리브레이션 (처음 1회)
  ];


   for (const command of luminanceOnlyCommands) {
     await serialPortManager.sendData(command);
    //  console.log(`Sent command: ${command}`);
     await new Promise(resolve => setTimeout(resolve, 10));
   }

   /* Device Init End */
   //res.status(200).json({ message: 'Data sent successfully' });
  

    return res.status(200).json({
      success: true,
      message: 'Port opened successfully',
      portList: ports.map(p => p.path),
      selectedPort: selectedPort
    });

  } catch (err) {
    return res.status(200).json({
      success: false,
      message: err.message,
      portList: [],
      selectedPort: null
    });
  }
});


/* Serial Port 닫기 */
router.post('/close', async(req,res)=>{
  const { portName, baudRate } = req.body;
  const serialPortManager = SerialPortManager.getInstance(portName, baudRate);
  serialPortManager.closePort()
    .then(() => res.status(200).json({ message: 'Port closed successfully' }))
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.get('/status', async (req, res) => {
  const { portName, baudRate } = req.body;
  const serialPortManager = SerialPortManager.getInstance(portName, baudRate);
  try {
    const status = {
      isOpen: serialPortManager.isOpen,
      portName: serialPortManager.portName,
      baudRate: serialPortManager.baudRate
    };
    res.status(200).json(status);
  } catch (error) {
    res.status(200).json({ error: error.message });
  }
});

router.get('/clean', async(req,res)=>{
  const result = await deleteFile();
  if (result) {
    res.status(200).json({ message: 'Log file cleaned successfully' });
  } else {
    res.status(200).json({ message: 'nothing to delete it' });
  }
})

router.get('/measure', async(req, res) => {
  const serialPortManager = SerialPortManager.getInstance("COM4", 38400);
 
  const luminanceOnlyCommands = [
    "COM,1\n",    // 통신 시작
    "MMS,1\n",    // 측정 모드: 휘도(Lv)만 측정
    "MES,1\n"     // 측정 시작 , OKXX,프로브,캘리브레이션채널,x,y,Lv,Flicker%,Flicker[dB] // OK04,P1,0,-99999999,-99999999,-99999999,-0.02,0.7662706
  ];
  
  try {
    for (const command of luminanceOnlyCommands) {
      await serialPortManager.sendData(command);
      // console.log(`Sent command: ${command}`);
      // CA410이 명령을 처리할 시간 제공
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    res.status(200).json({ message: 'Data sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});


/* 감마 액셀 파일  */
router.get('/downloadgamma', async(req, res) => {
  try {
    const createdFile = await readTextWriteExcel();
    if (!createdFile) {
      return res.status(500).json({ error: 'Error creating file' });
    }
    
    console.log('Download Gamma from route: ' + createdFile);
    
    // 파일 존재 및 크기 확인
    const fs = require('fs');
    if (!fs.existsSync(createdFile)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const stats = fs.statSync(createdFile);
    console.log('Original file size:', stats.size, 'bytes');
    
    // 바이너리 모드로 파일 읽기
    const fileBuffer = fs.readFileSync(createdFile);
    console.log('Buffer size:', fileBuffer.length, 'bytes');
    
    // 올바른 헤더 설정
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="gamma_report.xlsx"');
    res.setHeader('Content-Length', stats.size);
    
    // 방법 1: 파일 스트림 사용 (메모리 효율적)
    const fileStream = fs.createReadStream(createdFile);
    fileStream.pipe(res);
    
    // 방법 2: 버퍼 직접 전송 (간단함)
    // res.send(fileBuffer);
    
  } catch (error) {
    console.error('Error in downloadgamma:', error);
    res.status(500).json({ error: error.message });
  }
});

/* 저장된 파일 제거  */
router.get('/clean', async(req, res) => {
  await deleteFile();
  return res.status(200).json({ message: 'All files deleted successfully' });

});

router.get('/getData', async (req, res) => {
  const rawData = await getRawData();
  res.status(200).json(rawData);
});

module.exports = router;


