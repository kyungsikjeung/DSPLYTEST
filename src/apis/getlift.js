import createAxiosInstance from '.';
// ! Client Import
// import getLift from "../apis/getLiftCustom";
/*
import getLift from './path/to/getLift';

// 예제 1: 기본 경로만 사용
const fetchLiftData = async () => {
  try {
    const response = await getLift('some/path');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error fetching lift data:', error);
  }
};

const fetchLiftDataWithValue = async () => {
  try {
    const response = await getLift('some/path', 'someValue');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error fetching lift data:', error);
  }
};

*/

const deviceApi = createAxiosInstance('device/lift');

const getLift = async (path, value = '') => {
  let url = `${path}`;
  if (value) {
    url = `${url}/${value}`;
  }
  return await deviceApi({
    method: 'get',
    url: url,
  });
};

export default getLift;
