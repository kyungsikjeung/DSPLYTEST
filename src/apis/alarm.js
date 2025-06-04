import createAxiosInstance from '.';

const alarmApi = createAxiosInstance('alarm');

/* apply 버튼 클릭 시  */
export const applyAlarm = async (pathData) => {
  try {
    const response = await alarmApi.post('/write', pathData);
    return response.data;
  } catch (error) {
    console.error('Error writing register:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/* 알람 경고등 리드 명령 */
export const readAlarm = async (pathData) => {
  try {
    const response = await alarmApi.get('/read', pathData);
    return response.data;
  } catch (error) {
    console.error('Error reading register:', error.response ? error.response.data : error.message);
    throw error;
  }
};
