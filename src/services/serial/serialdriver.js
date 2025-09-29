const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const receivedEvent = require("../event/event.js");
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const {appendLog} = require('../logs/log.js');

// 개발 환경과 프로덕션 환경 구분
let LOG_DIR;
// 더 안전한 패키징 감지 방법
let isPackaged = false;
try {
  const { app } = require('electron');
  isPackaged = app.isPackaged;
} catch (err) {
  // electron이 없거나 접근할 수 없는 경우, 경로로 판단
  isPackaged = __dirname.includes('app.asar') || process.resourcesPath !== process.cwd();
}

console.log('Environment check:', {
  isPackaged,
  __dirname,
  'process.cwd()': process.cwd(),
  'process.resourcesPath': process.resourcesPath
});

if (isPackaged) {
  // 프로덕션: extraResources로 복사된 경로 사용
  LOG_DIR = path.join(process.resourcesPath, 'src', 'services', 'logs');
  console.log('Using PRODUCTION path:', LOG_DIR);
} else {
  // 개발: 프로젝트 루트에서 찾기
  LOG_DIR = path.join(process.cwd(), 'src', 'services', 'logs');
  console.log('Using DEVELOPMENT path:', LOG_DIR);
}

const excelFile = path.join(LOG_DIR, 'gamma_result.xlsx');
const logFilePath = path.join(LOG_DIR, 'ca410_log.txt');

// 로그 디렉터리 생성
try {
  fs.accessSync(LOG_DIR, fs.constants.F_OK);
  console.log('로그 디렉터리가 이미 존재합니다:', LOG_DIR);
} catch (err) {
  // 디렉터리가 존재하지 않음
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    console.log('로그 디렉터리 생성 성공:', LOG_DIR);
  } catch (mkdirErr) {
    console.error('로그 디렉터리 생성 실패:', mkdirErr);
  }
}

// Excel 파일 초기화 함수
async function initializeExcelFile() {
  try {
    // 파일이 존재하는지 확인
    fs.accessSync(excelFile, fs.constants.F_OK);
    console.log('Excel 파일이 이미 존재합니다:', excelFile);
  } catch (err) {
    // 파일이 없으면 새로 생성
    console.log('Excel 파일을 새로 생성합니다:', excelFile);
    try {
      const XlsxPopulate = require("xlsx-populate");
      const workbook = await XlsxPopulate.fromBlankAsync();
      const sheet = workbook.sheet("Sheet1");
      
      // 기본 헤더 설정
      sheet.cell("A1").value("Index");
      sheet.cell("B1").value("Luminance");
      sheet.cell("C1").value("Timestamp");
      
      await workbook.toFileAsync(excelFile);
      console.log('Excel 파일 생성 완료:', excelFile);
    } catch (createErr) {
      console.error('Excel 파일 생성 실패:', createErr);
    }
  }
}

// 초기화 실행
initializeExcelFile();




// try {
//   fs.accessSync(logDir, fs.constants.F_OK);
//   console.log('디렉터리가 이미 존재합니다');
// } catch (err) {
//   // 디렉터리가 존재하지 않음
//   try {
//     fs.mkdirSync(logDir, { recursive: true });
//     console.log('디렉터리 생성 성공');
//   } catch (mkdirErr) {
//     console.error('디렉터리 생성 실패:', mkdirErr);
//   }
// }


// ---- CA-410 기본 통신 파라미터(필요 시 변경 가능) ----
const CA410_DEFAULTS = Object.freeze({
  baudRate: 38400,
  dataBits: 7,
  stopBits: 2,
  parity: 'even',
  rtscts: true,
  autoOpen: false,
  delimiter: '\r', // !주의 CA410은 보통 CR 응답
});

// ---- 유틸: 디렉터리 보장 ----
// async function ensureLogDir() {
//   try {
//     await fs.access(logFilePath).catch(async () => {
//       await fs.writeFile(logFilePath, '', 'utf8');
//     });
//   } catch (e) {
//     // eslint-disable-next-line no-console
//     console.error('로그 디렉터리 생성 실패:', e);
//   }
// }



// ---- 유틸: CA-410 응답 라인에서 Lv 값 추출 ----
// 예시: "OK00,P1,0,0.5450233,0.1500855,1.2105391,-1.84,-99999999"
function parseCA410LineForLv(line) {
  if (!line || typeof line !== 'string') return null;
  // 간단 검사
  if (!line.includes('OK') || !line.includes('P1')) return null;

  const arr = line.split(',');
  // Lv가 인덱스 5에 온다는 전제(사양 기반). 길이 검사 필수
  if (arr.length > 5) {
    const lv = arr[5]?.trim();
    // 숫자 형태인지 확인
    if (lv && !Number.isNaN(Number(lv))) return lv;
  }
  return null;
}



class SerialPortManager {
  static #instance = null;
  #busy;

  static getInstanceWithoutPort() {
    return SerialPortManager.#instance;
  }

  static getInstance(portName, baudRate) {
    if (!SerialPortManager.#instance) {
      SerialPortManager.#instance = new SerialPortManager(portName, baudRate);
    }
    
    return SerialPortManager.#instance;
  }

  constructor(portName, baudRate = CA410_DEFAULTS.baudRate) {
    if (SerialPortManager.#instance) {
      return SerialPortManager.#instance;
    }
    this.events = receivedEvent;
    this.isOpen = false;
    this.portName = null;
    this.baudRate = null;
    this.serialPort = null;
    this.parser = null;
    this.#busy = Promise.resolve();

    this.#configure(portName, baudRate);
    SerialPortManager.#instance = this;
  }

  // ---- 내부: 리스너 모두 제거 ----
  #teardownListeners() {
    if (this.parser) {
      this.parser.removeAllListeners();
    }
    if (this.serialPort) {
      this.serialPort.removeAllListeners('open');
      this.serialPort.removeAllListeners('error');
      this.serialPort.removeAllListeners('close');
      this.serialPort.removeAllListeners(); // 안전망

    }
  }

  // ---- 내부: 포트 설정/파이프 구성 ----
  #configure(portName, baudRate = CA410_DEFAULTS.baudRate) {
    // 기존 리스너/스트림 정리
    this.#teardownListeners();

    this.portName = portName;
    this.baudRate = baudRate;

    this.serialPort = new SerialPort({
      path: this.portName,
      baudRate: this.baudRate,
      dataBits: CA410_DEFAULTS.dataBits,
      stopBits: CA410_DEFAULTS.stopBits,
      parity: CA410_DEFAULTS.parity,
      rtscts: CA410_DEFAULTS.rtscts,
      autoOpen: CA410_DEFAULTS.autoOpen,
    });

    this.parser = this.serialPort.pipe(
      new ReadlineParser({ delimiter: CA410_DEFAULTS.delimiter })
    );

    // 데이터 파싱 & 로그
    this.parser.on('data', async (line) => {
      try {
        const text = typeof line === 'string' ? line : Buffer.from(line).toString('utf8');
        // eslint-disable-next-line no-console
        console.log(`Parser data: ${text}`);
        const lv = parseCA410LineForLv(text);
        if (lv !== null) { // 검사 통과
          console.log('here')
          await appendLog(lv);
        }
        this.events.emit('data-received', text);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('parser 처리 중 오류:', e);
      }
    });

    // 포트 이벤트
    this.serialPort.on('open', () => {
      this.isOpen = true;
      // eslint-disable-next-line no-console
      console.log('🔌 Serial port opened');
      this.events.emit('open');
    });

    this.serialPort.on('error', (err) => {
      console.error('Serial port error:', err);
      // UI에 안내, 재시도, 로그 등
    });

    this.serialPort.on('close', () => {
      // eslint-disable-next-line no-console
      console.warn('🔒 Serial port closed');
      this.isOpen = false;
      this.#resetConfig();
      this.events.emit('close');
    });
  }

  // ---- 외부: 이벤트 구독/해제 ----
  on(event, listener) { this.events.on(event, listener); }
  off(event, listener) { this.events.off(event, listener); }

  // ---- 포트 열기/닫기(직렬화) ----
  openPort() {
    this.#busy = this.#busy.then(() => new Promise((resolve, reject) => {
      if (this.isOpen) return resolve();
      this.serialPort?.open((err) => {
        if (err) {
          console.error('Open error:', err);
          return reject(err);
        }
        resolve();
      });
    }));
    return this.#busy;
  }

  closePort() {
    return new Promise((resolve, reject) => {
      if (!this.isOpen) return resolve();
      this.serialPort.close((err) => {
        if (err) {
          console.error('Close error:', err);
          return reject(err);
        }
        resolve();
      });
    });
  }

  // ---- 내부: 구성 초기화 ----
  #resetConfig() {
    // eslint-disable-next-line no-console
    console.log('♻️ SerialPortManager 설정 초기화');
    this.#teardownListeners();
    this.parser = null;
    this.serialPort = null;
    this.isOpen = false;
    // busy 초기화
    this.#busy = Promise.resolve();
    SerialPortManager.#instance = null;
    
  }

  // ---- 포트 스위치(안전한 재오픈) ----
  switchPort(portName, baudRate = CA410_DEFAULTS.baudRate, { reopen = true } = {}) {
    this.#busy = this.#busy.then(async () => {
      const needSwitch = this.portName !== portName || this.baudRate !== baudRate;
      if (!needSwitch) {
        if (reopen && !this.isOpen) await this.openPort();
        return;
      }
      if (this.isOpen) await this.closePort();
      this.#configure(portName, baudRate);
      if (reopen) await this.openPort();
    });
    return this.#busy;
  }

  // ---- 송신(즉시) ----
  async sendData(msg, { encoding = 'ascii', append = '' } = {}) {
    if (!this.isOpen) throw new Error('Port is not open');
    const buf = Buffer.from(String(msg) + append, encoding);
    await new Promise((res, rej) => this.serialPort.write(buf, (e) => (e ? rej(e) : res())));
    await new Promise((res, rej) => this.serialPort.drain((e) => (e ? rej(e) : res())));
  }

  // ---- 송신(느리게 한 바이트씩) ----
  async sendDataSlow(msg, { encoding = 'ascii', append = '', byteDelayMs = 110 } = {}) {
    if (!this.isOpen) throw new Error('Port is not open');
    const message = String(msg) + append;
    const bytes = Buffer.from(message, encoding);
    let index = 0;
    // eslint-disable-next-line no-console
    console.log(`Sending slowly: ${message}`);

    return new Promise((resolve, reject) => {
      const sendNextByte = () => {
        if (index >= bytes.length) {
          // eslint-disable-next-line no-console
          console.log('All bytes sent successfully');
          return resolve();
        }
        this.serialPort.write(Buffer.from([bytes[index]]), (err) => {
          if (err) {
            // eslint-disable-next-line no-console
            console.log('Error on write: ', err.message);
            return reject(err);
          }
          index += 1;
          setTimeout(sendNextByte, byteDelayMs);
        });
      };
      sendNextByte();
    });
  }

  // ---- 포트 목록 ----
  static listPorts() {
    return SerialPort.list();
  }

  // ---- 완전 파기(싱글턴 해제) ----
  async dispose() {
    try {
      if (this.isOpen) await this.closePort();
    } finally {
      this.#resetConfig();
      SerialPortManager.#instance = null;
    }
  }
}

module.exports = {
  SerialPortManager,
  fs, // 기존 호환성 유지가 필요하면 내보냄 (가능하면 외부에서 직접 fs 사용 권장)
  excelFile,
  logFilePath,
  utils: {    
    parseCA410LineForLv,
  },
};
