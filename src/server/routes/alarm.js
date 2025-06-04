//const SerialPortManager = require('../serial/serial.js');
const express = require('express');
const SerialPortManager = require('../serial/serial_dev.js');

const router = express.Router();
router.use(express.json());

/* 알람값 레지스터 쓰기
 * @param : alarmData  - Stringify Array
 */
router.post('/write', (req, res) => {
  const serialPortManager = SerialPortManager.getInstance(); // 인스턴스 가져오기
//  if (!serialPortManager || !serialPortManager.isOpen) {
//     return res.status(200).json({ error: 'Port is not connected' });
//   }
  const {alarmData,mode} = req.body;
  const  alarmArr = JSON.parse(alarmData);
  const stringAlarm  = alarmArr.join("");
  const decimalAlarmValue = parseInt(stringAlarm, 2)
  const operationCode = 'almw4'
  if(mode == 'normal'){
    console.log('normal mode')
  }else if(mode == 'safety'){
    console.log('saefty mode')
  }
  // TODO : 주소 픽스 해줘야 함 
  const regAddr = '60001854'
  const regValue = decimalAlarmValue.toString(16).padStart(8,'0');
  // TODO : padding 확인 해봐야함. (몇 바이트로 보내야 하는지 프로토콜)
  const dataToSend = `${operationCode} ${regAddr} 0x${regValue}\r\n`;
  console.log(dataToSend);
  const bufferData = Buffer.from(dataToSend, 'ascii'); // 데이터 형식에 맞게 변환 (예: ascii, utf-8 등)
  serialPortManager.sendData(dataToSend);
  return res.status(200).send({ data: '알람 경고등 라이트 명령 전송' });
  // serialPortManager.serialPort.write(bufferData, (err) => {
  //   if (err) { // 에러 처리 
  //     console.error('시리얼 포트 쓰기 에러:', err.message);
  //     return res.status(500).json({ error: 'Failed to write to serial port' });
  //   }
  //   console.log('데이터가 성공적으로 전송되었습니다:', dataToSend);
  //   res.status(200).send({ data: '레지스터 값이 성공적으로 세팅되었습니다.' });
  // });  
});

/* 알람값 레지스터 읽기 */
router.get('/read', (req, res) => {
  const serialPortManager = SerialPortManager.getInstance(); // 인스턴스 가져오기
  if (!serialPortManager || !serialPortManager.isOpen) { // 에러 처리
    return res.status(200).json({ error: 'Port is not connected' });
  }
  const {mode} = req.body;
  console.log(mode);
  const operationCode = 'almr2'; // TODO : 오퍼레이션 코드 확인
  const regAddr = '60001854';  // TODO : 주소 픽스 해줘야 함
  const dataToSend = `${operationCode} ${regAddr}\r\n`;
  console.log(dataToSend);
  const bufferData = Buffer.from(dataToSend, 'ascii'); // 데이터 형식에 맞게 변환 (예: ascii, utf-8 등)
  // 시리얼 포트로 데이터 전송
  // serialPortManager.serialPort.write(bufferData, (err) => {
  //   if (err) {
  //     console.error('시리얼 포트 쓰기 에러:', err.message);
  //     return res.status(500).json({ error: 'Failed to write to serial port' });
  //   }
  //   console.log('데이터가 성공적으로 전송되었습니다:', dataToSend);
  //   res.status(200).send({ data: '레지스터 값이 성공적으로 세팅되었습니다.' });
  // });  
  serialPortManager.sendData(dataToSend);
  return res.status(200).send({ data: '알람 경고등 리드 명령 전송' });
});

module.exports = router;
