import createAxiosInstance from '.';

const logApi = createAxiosInstance('log');

/* READ REGISTER */
export const readReg = async (pathData) => {
  try {
    const response = await logApi.post('/read', pathData);
    return response.data;
  } catch (error) {
    console.error('Error reading register:', error.response ? error.response.data : error.message);
    throw error;
  }
};
