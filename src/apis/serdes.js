import createAxiosInstance from '.';

const serdesApi = createAxiosInstance('serdes');

/* WRITE REGISTER */
export const writeReg = async (pathData) => {
  try {
    const response = await serdesApi.post('/write', pathData);
    return response.data;
  } catch (error) {
    console.error('Error writing register:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/* READ REGISTER */
export const readReg = async (pathData) => {
  try {
    const response = await serdesApi.post('/read', pathData);
    return response.data;
  } catch (error) {
    console.error('Error reading register:', error.response ? error.response.data : error.message);
    throw error;
  }
};
