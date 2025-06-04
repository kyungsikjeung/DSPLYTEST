import createAxiosInstance from '.';

const serialApi = createAxiosInstance('serial');

/* 시리얼 포트 목록 가져오기 */
export const getSerialPortList = async () => {
  try {
    const response = await serialApi.get('/list');
    return response.data;
  } catch (error) {
    console.error('Error writing register:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/* READ REGISTER */
export const openSerialPort = async (pathData) => {
  try {
    const response = await serialApi.post('/open', pathData);
    return response.data;
  } catch (error) {
    console.error('Error reading register:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/* READ REGISTER */
export const closeSerialPort = async (pathData) => {
  try {
    const response = await serialApi.post('/close', pathData);
    return response.data;
  } catch (error) {
    console.error('Error reading register:', error.response ? error.response.data : error.message);
    throw error;
  }
};
