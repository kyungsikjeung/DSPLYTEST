import axios from 'axios';
const BASE_URL = 'http://localhost:5000/api';
function createAxiosInstance(url) {
  const instance = axios.create({
    baseURL: `${BASE_URL}/${url}`,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
  return instance;
}

export default createAxiosInstance;
