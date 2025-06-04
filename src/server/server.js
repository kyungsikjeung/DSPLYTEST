const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path')
const app = express();
// Helmet을 사용하여 CSP 설정 추가
// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//   })
// );

// CSP 설정
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", 'https://cdn.jsdelivr.net'],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
//       connectSrc: ["'self'", 'http://localhost:3000', 'http://localhost:5000'],
//       imgSrc: ["'self'", 'http://localhost:3000', 'http://localhost:5000'], //! Electron에서 이미지 불러오기 위해 추가
//     },
//   })
// );


app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "http://localhost:3000", "http://localhost:5000"],
      imgSrc: ["'self'", "http://localhost:3000", "http://localhost:5000", "data:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5000"],
      fontSrc: ["'self'", "http://localhost:3000", "http://localhost:5000"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
const port = 5000;
// const { SerialPort } = require('serialport');
// console.log(SerialPort.list());
// router.use(cors());
const SerialPortManager = require('./serial/serial_dev.js');
SerialPortManager.listPorts();
// 라우터 설정
/*
    .env
    │
    public/
    │
    ├── images/ -- 사용 안함
    src/
    │
    ├── server.js
    ├── routes/
    │   ├── img.js
    │   ├── alarm.js
    │   └── serialPorts.js
    └── serial/
        └── serial.js
*/

/* 서비스 별 API 분리  */
const indexRouter = require('./routes/index.js');
const alarmRouter = require('./routes/alarm.js');
const serdesRouter = require('./routes/serdes.js');
const logRouter = require('./routes/log.js');
const usbRouter = require('./routes/usb.js');


const serialPortsRouter = require('./routes/serialPorts.js');
const imgRouter = require('./routes/img');



// API 처리 라우터
app.use('/api/alarm', alarmRouter);
app.use('/api/serial', serialPortsRouter);
app.use('/api/img', imgRouter);
app.use('/api/serdes', serdesRouter);
app.use('/api/log', logRouter);
app.use('/api/usb', usbRouter);


// !TODO:: 나중에 라우터로 설정 변경해야함, 유지 보수성
// 시리얼 포트 리스트
app.get('/api/serial-ports', async (req, res) => {
  try {
    const ports = await SerialPortManager.listPorts();
    res.json({ success: true, ports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 시리얼 포트에 대해서 초기화
app.get('/api/serial-init', async (req, res) => {
  try {
    // /api/serial-init/3 -> portName: 3
    const portName = req.query.portName;

    console.log('portName:', portName);

    if (!SerialPortManager.instance) {
      SerialPortManager.instance = new SerialPortManager(portName);
    }

    await SerialPortManager.instance.openPort(portName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// 모든 경로에 대해 index.html 제공
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });


// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

process.stdin.resume();
