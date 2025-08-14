const express = require('express');
const router = express.Router();
const {SerialPortManager,fs,exelFile,logFilePath} = require('../services/serial/serialdriver.js');
const XlsxPopulate = require("xlsx-populate");

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


router.get('/list', async (req, res) => {
  try {
    const ports = await SerialPortManager.listPorts(); // SerialPort.list()
    const portNames = ports.map(port => port.path);
    res.status(200).json(portNames);
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
    console.log("연결 시도:", JSON.stringify(filteredPorts));
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
     console.log(`Sent command: ${command}`);
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

router.get('/clean', (req,res)=>{
  fs.writeFileSync(logFilePath, '', 'utf-8'); // 파일만 비우기
  res.status(200).json({ message: 'Log file cleaned successfully' });
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
      console.log(`Sent command: ${command}`);
      // delay
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    res.status(200).json({ message: 'Data sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});


/* 감마 액셀 파일  */
router.get('/downloadgamma', async(req, res) => {
  try {
    if (!fs.existsSync(logFilePath)) {
      return res.status(404).json({ error: 'File not found' });
    }    
    // Get Line log filePath
    fs.readFile(logFilePath, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading log file:', err);
        return res.status(500).json({ error: 'Error reading log file' });
      }
      const lines = data.split('\n').filter(line => line.trim() !== '');
      console.log('Read lines length:', lines.length);
      let sheetNum  = (Number(lines.length)  / Number(64));
      console.log('Sheet number:', sheetNum);
      for(var i=0; i< sheetNum; i++ ){
          let column = '';
          switch(i){
            case 0:
              column = 'C';
                break;
              case 1:
              column = 'E';
              break;
            case 2:
              column = 'G';
              break;
            case 3:
              column = 'I';
              break;
            case 4:
              column = 'K';
              break;
            default:
              column = 'C';
          }
          const startRow = 7;
          const endRow = 70;  //  64개 데이터
          console.log(`Column: ${column}, Start Row: ${startRow}, End Row: ${endRow}`);

          //  320개 풀로 채웠을떄 C,E,,G,I,K
      }
      for(let i=0; i<lines.length; i++){
        const col = String.fromCharCode(67 + (Number(i)/Number(64)) ); // C, E, G, I, K
        const row = Number(i) % Number(64) + 7;
        const data = lines[i];
        console.log(`cell: ${col}${row} with data: ${data}`);
      }
      

      res.json({ lines }); // line들에 대해서 읽은값
    });


  } catch (error) {
    res.status(200).json({ error: error.message });
  }

});

router.get('/downloadcontratioratio', async(req, res) => {
  try {
    if (!fs.existsSync(logFilePath)) {
      return res.status(404).json({ error: 'File not found' });
    }    
    // Get Line log filePath
    fs.readFile(logFilePath, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading log file:', err);
        return res.status(500).json({ error: 'Error reading log file' });
      }
      const lines = data.split('\n').filter(line => line.trim() !== '');
      res.json({ lines });
    });


  } catch (error) {
    res.status(200).json({ error: error.message });
  }

});


module.exports = router;


