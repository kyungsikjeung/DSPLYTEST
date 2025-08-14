// api/serial.js
import createAxiosInstance from '.';

const serialApi = createAxiosInstance('serial'); // baseURL: http://localhost:5000/api/serial

/** @typedef {{success:boolean,message:string,portList:string[],selectedPort:string|null}} ConnectResponse */
/** @typedef {{isOpen:boolean,portName:string|null,baudRate:number|null}} StatusResponse */
/** @typedef {{message:string}} SimpleMessage */
/** @typedef {{lines:string[]}} LinesResponse */



/** GET /list : 사용 가능한 포트 목록 반환 */
export const listSerialPorts = async () => {
  try {
    const { data } = await serialApi.get('/list'); // { ports: string[] }
    return data.ports;
  } catch (error) {
    console.error('Error on /list:', error?.response?.data ?? error.message);
    throw error;
  }
};

/** GET /connect : 자동 선택 & 연결 + 포트 목록 반환 */
export const connectSerial = async () => {
  try {
    const { data } = await serialApi.get('/connect'); // ConnectResponse
    return data;
  } catch (error) {
    console.error('Error on /connect:', error?.response?.data ?? error.message);
    throw error;
  }
};

/** POST /close : { portName, baudRate } */
export const closeSerialPort = async (payload) => {
  try {
    const { data } = await serialApi.post('/close', payload); // SimpleMessage
    return data;
  } catch (error) {
    console.error('Error on /close:', error?.response?.data ?? error.message);
    throw error;
  }
};

/** GET /status : 현재 싱글턴 상태 반환 (GET은 body 없음) */
export const getSerialStatus = async () => {
  try {
    const { data } = await serialApi.get('/status'); // StatusResponse
    return data;
  } catch (error) {
    console.error('Error on /status:', error?.response?.data ?? error.message);
    throw error;
  }
};

/** GET /clean : 로그 파일 비우기 */
export const cleanLogFile = async () => {
  try {
    const { data } = await serialApi.get('/clean'); // SimpleMessage
    return data;
  } catch (error) {
    console.error('Error on /clean:', error?.response?.data ?? error.message);
    throw error;
  }
};

/** GET /measure : 휘도 측정 명령 전송 */
export const measureLuminance = async () => {
  try {
    const { data } = await serialApi.get('/measure'); // SimpleMessage
    return data;
  } catch (error) {
    console.error('Error on /measure:', error?.response?.data ?? error.message);
    throw error;
  }
};

/** GET /downloadgamma : 로그 라인 반환 */
export const downloadGamma = async () => {
  try {
    const { data } = await serialApi.get('/downloadgamma'); // LinesResponse
    return data;
  } catch (error) {
    console.error('Error on /downloadgamma:', error?.response?.data ?? error.message);
    throw error;
  }
};

/** GET /downloadcontratioratio : 로그 라인 반환 */
export const downloadContrastRatio = async () => {
  try {
    const { data } = await serialApi.get('/downloadcontratioratio'); // LinesResponse
    return data;
  } catch (error) {
    console.error('Error on /downloadcontratioratio:', error?.response?.data ?? error.message);
    throw error;
  }
};

// has Ca 410
export const hasCA410 = async () => {
  try {
    const { data } = await serialApi.get('/hasCA410'); // { hasCA410: boolean }
    console.log(data.hasCA410)
    return data.hasCA410;
  } catch (error) {
    console.error('Error on /hasCA410:', error?.response?.data ?? error.message);
    throw error;
  }
};