// serial/serial.js

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const serialEmitter = require('./serialEmitter.js');

class SerialPortManager {
  // MCU에 연결되는 포트 1개, 싱글턴 패턴으로 구현
  // 이미 포트가 연결되어 있는데, 다시 객체 생성하여 충돌 방지하기 위함
  static instance = null;

  // 시리얼 연결이 안되어 있을 때에만, 초기 설정
  // 이미 연결되어 있으면, 기존 연결 유지
  // !설계의도: 연결 해제는 closePort()로 해제할것
  constructor(portName, baudRate = 115200) {
    // 기존의 인스턴스가 있으면 기존 인스턴스 반환
    if (SerialPortManager.instance) {
      return SerialPortManager.instance;
    }
    // Configuration 대로 설정
    this.portName = portName;
    this.baudRate = baudRate;
    this.serialPort = null;
    this.parser = null;
    this.isOpen = false;
    // 시리얼 포트 초기화
    this._init();
    // 싱글턴 패턴으로 인스턴스 설정
    SerialPortManager.instance = this;
  }
  
  // 디바이스 초기화 상세
  _init() {
    this.serialPort = new SerialPort({
      path: this.portName,
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      autoOpen : true,
      endOnClose: true,
      rtscts: false, // Enable RTS/CTS flow control if required by your USB-to-TTL adapter
    });
    this.isOpen = true;
    // 시리얼 포트 파이프 
    this.parser = this.serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    // 시리얼 파이프에서 데이터 발생 시, 엔드라인이 발생 시 데이터 수신
    this.parser.on('data', (data) => {
      const utf8Data = Buffer.from(data, 'ascii').toString('utf-8'); // ASCII로 받은 데이터를 UTF-8로 변환
      console.log(utf8Data);
      // 외부 모듈에 UTF-8 데이터 전달
      serialEmitter.emit('data-received', utf8Data);
        /*
          serialEmitter.on('data-receive', (data) => {
           // 외부 모듈
          });
       */
    });
    // 포트가 연결됨
    this.serialPort.on('open', () => {
      console.log('포트가 성공적으로 열렸습니다.');
      serialEmitter.emit('port-open', null); 
      this.isOpen = true;
    });
    // 포트 에러가 남
    this.serialPort.on('error', (err) => {
      console.error('시리얼 포트 에러:', err.message);
      serialEmitter.emit('port-err', err.message); 
      SerialPortManager.instance = null;
      this.isOpen = false;
    });
    // 포트 닫혔음. 
    this.serialPort.on('close', () => {
      console.log('포트가 닫혔습니다.');
      serialEmitter.emit('port-close',null); 
      SerialPortManager.instance = null;
      this.isOpen = false;
    });
  }

  openPort() {
    return new Promise((resolve, reject) => {
      if (this.isOpen) {
        console.log('포트가 이미 열려 있습니다. 먼저 닫습니다.');
        this.closePort(); // 먼저 포트를 닫음
      }

      this.serialPort.open((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('포트가 성공적으로 열렸습니다.');
          this.isOpen = true;
          resolve();
        }
      });
    });
  }

  static closePort() {
    // if (SerialPortManager.instance && SerialPortManager.instance.serialPort && SerialPortManager.instance.isOpen) {
    //   SerialPortManager.instance.serialPort.close((err) => {
    //     if (err) {
    //       console.error('포트 닫기 에러:', err.message);
    //     } else {
    //       console.log('포트가 성공적으로 닫혔습니다.');
    //       if(SerialPortManager.instance && SerialPortManager.instance.isOpen!=null){
    //         SerialPortManager.instance.isOpen = false;
    //       }
    //       if(SerialPortManager.instance !== null){
    //       SerialPortManager.instance = null;
    //       }
    //     }
    //   });
    // } else {
    //   console.log('포트가 이미 닫혀 있거나 열려 있지 않습니다.');
    //   SerialPortManager.instance = null;
    // }

    this.serialPort.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('포트가 성공적으로 닫혔습니다.');
        this.isOpen = false;
        resolve();
      }
    });
  }

  sendData(message) {
    
    if (!this.isOpen) {
      console.log('Port is not open. Cannot send message.');
      return;
    }

    const bytes = Buffer.from(message, 'ascii');
    let index = 0;
    console.log(`Sending message: ${message}`);
    const sendNextByte = () => {
      if (index < bytes.length) {
        this.serialPort.write(Buffer.from([bytes[index]]), (err) => {
          if (err) {
            return console.log('Error on write: ', err.message);
          }
          index++;
          setTimeout(sendNextByte, 110); // 각각의 바이트 마다 110ms 간격으로 전송, MCU 처리 시간 고려. 내가 UART 처리를 잘못한듯
        });
      } else {
        console.log('All bytes sent successfully');
        //c/allback();
      }
    };

    sendNextByte();
  }

  static getInstance(portName, baudRate) {
    if (portName && baudRate && !SerialPortManager.instance) {
      new SerialPortManager(portName, baudRate);
    }
    return SerialPortManager.instance;
  }

  static async listPorts() {
    try {
      const ports = await SerialPort.list();
      console.log(JSON.stringify(ports));
      return ports;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SerialPortManager;
