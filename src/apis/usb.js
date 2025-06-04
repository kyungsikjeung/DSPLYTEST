import createAxiosInstance from '.';

const usbApi = createAxiosInstance('usb');

/* apply 버튼 클릭 시  */
export const firmwareDownload = async (pathData) => {
  try {
    const response = await usbApi.post('/write', pathData);
    return response.data;
  } catch (error) {
    console.error('Error writing register:', error.response ? error.response.data : error.message);
    throw error;
  }
};

