//const SerialPortManager = require('../serial/serial.js');
const express = require('express');
const SerialPortManager = require('../serial/serial_dev.js');

const router = express.Router();
router.use(express.json());

/* 인디고 , 시리얼라이져, 디시리얼라이져 레지스터 값 쓰기 */
router.post('/write', (req, res) => {
  const serialPortManager = SerialPortManager.getInstance(); // 인스턴스 가져오기
  if (!serialPortManager || !serialPortManager.isOpen) { // 에러 처리
    return res.status(200).json({ error: 'Port is not connected' });
  }
  /* 요청 온 device Type, regAddr, regValue 확인 */
  var deviceType = String(req.body.deviceType);
  var regAddr = String(req.body.regAddr);
  var regValue = String(req.body.regValue);
  console.log(deviceType);
  if (!deviceType || !regAddr || !regValue) {
    return res.status(200).json({ error: '데이터를 확인해 주세요' });
  }

  /* 클라이언트 입력 받은 데이터 처리(입력 편의성 고려하여 엄격하게 룰 적용 X, 서버에서 처리)
  * ex) regAddr : 0x0212 혹은 0212, 212  
        regValue : 0x03, 3, 03
  *    -> WIB 40 0212 8B
  */
  switch (deviceType) {
    case 'serializer': //  wib 48 0212 8B
      deviceType = 'WIB 40';
      regAddr = regAddr.replace('0x', '').padStart(4, '0'); // 패딩 처리
      regValue = regValue.replace('0x', '').padStart(2, '0');
      break;
    case 'deserializer':
      deviceType = 'WIB 48';
      regAddr = regAddr.replace('0x', '').padStart(4, '0'); // 만약 0x 입력하면 제거 후 4자리로 변환(4바이트)
      regValue = regValue.replace('0x', '').padStart(2, '0');
      break;
    case 'indigo':
      regValue = regValue.replace('0x', ''); // 0x 제거
      const length = regValue ? regValue.length : 0;
      const paddingConfig = [
        { max: 2, paddingLength: 2, count: 1 },
        { max: 4, paddingLength: 4, count: 2 },
        { max: 8, paddingLength: 8, count: 4 },
      ];
      const config = paddingConfig.find((cfg) => length <= cfg.max);

      if (!config || length > config.max || length == 0) {
        return res.status(200).json({ error: '레지스터 값이 길이를 초과합니다' });
      }
      regAddr = regAddr.replace('0x', '');
      regAddr = `0x${regAddr}`;
      regValue = `0x${regValue.padStart(config.paddingLength, '0')}`;
      deviceType = `almw${config.count}`;
      break;
    default:
      break;
  }

  // 시리얼 포트로 전송할 데이터를 버퍼로 변환
  const dataToSend = `${deviceType} ${regAddr} ${regValue}\r\n`;
  console.log(dataToSend);
  serialPortManager.sendData(dataToSend);
  res.status(200).send({ data: '레지스터 값이 성공적으로 세팅되었습니다.' })
  // const bufferData = Buffer.from(dataToSend, 'ascii'); // 데이터 형식에 맞게 변환 (예: ascii, utf-8 등)

  // 시리얼 포트로 데이터 전송
  // serialPortManager.serialPort.write(bufferData, (err) => {
  //   if (err) {
  //     console.error('시리얼 포트 쓰기 에러:', err.message);
  //     return res.status(500).json({ error: 'Failed to write to serial port' });
  //   }
  //   console.log('데이터가 성공적으로 전송되었습니다:', dataToSend);
  //   res.status(200).send({ data: '레지스터 값이 성공적으로 세팅되었습니다.' });
  // });
});

/* 인디고 , 시리얼라이져, 디시리얼라이져 레지스터 값 읽기 */
router.post('/read', (req, res) => {
  const serialPortManager = SerialPortManager.getInstance(); // 인스턴스 가져오기

  // if (!serialPortManager || !serialPortManager.isOpen) {
  //   return res.status(200).json({ error: 'Port is not connected' });
  // }

  var deviceType = String(req.body.deviceType);
  var regAddr = String(req.body.regAddr);
  var regValue = String(req.body.regValue); // register value 포함되어야 함.

  console.log(deviceType, regAddr);
  var operationCode = '';
  switch (deviceType) {
    // Handle indigo read logic
    case 'serializer':
      operationCode = 'rib 40';
      regAddr = regAddr.replace('0x', '').padStart(4, '0');
      break;
    case 'deserializer':
      operationCode = 'rib 48';
      regAddr = regAddr.replace('0x', '').padStart(4, '0');
      break;
    case 'indigo':
      if(!regValue){
        operationCode = 'almr1';
      }else{
        operationCode = `almr${regValue}`;
      }
      //operationCode = 'almr1';
      regAddr = regAddr.replace('0x', '').padStart(8, '0');
      break;
    default:
      return res.status(400).json({ error: 'Invalid device type' });
  }
  const dataToSend = `${operationCode} ${regAddr}\r\n`;
  console.log(dataToSend);
  serialPortManager.sendData(dataToSend);
  // const bufferData = Buffer.from(dataToSend, 'ascii'); // 데이터 형식에 맞게 변환 (예: ascii, utf-8 등)

  // // 시리얼 포트로 데이터 전송
  // serialPortManager.serialPort.write(bufferData, (err) => {
  //   if (err) {
  //     console.error('시리얼 포트 쓰기 에러:', err.message);
  //     return res.status(500).json({ error: 'Failed to write to serial port' });
  //   }
  //   console.log('데이터가 성공적으로 전송되었습니다:', dataToSend);
    
  // });
  

  res.status(200).send({ data: '레지스터 값을 읽고 있습니다...' });

});

module.exports = router;
