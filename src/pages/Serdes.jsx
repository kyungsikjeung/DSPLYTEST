import React, { useState, useEffect } from 'react';
import { writeReg, readReg } from '../apis/serdes.js'; // 레지스터 읽기, 쓰기

/*  
* @brief 레지스터 세팅 페이지(Serializer , Deserializer, Indigo) 
*/
export const Serdes = () => {
  const ipcRenderer = window.ipcRenderer;
  const [log, setLog] = useState(''); // 터미널 창 로그
  const [formData, setFormData] = useState({ regAddr: '', regValue: '' }); // 레지스터 주소, 값
  const [deviceType, setDeviceType] = useState('serializer'); // 시리얼라이져, 디시리얼라이져, 인디고
  const [hasError, setHasError] = useState(false); // 에러 시, 로그 텍스트 색상 빨강 변경

  useEffect(() => {
    // 현재 페이지가 렌더링 될 때, 시리얼 데이터 수신,
    // TODO : 현제 기능 사용 하지 않지만, 추후 시리얼 데이터 안받는 경우, 
    // TODO : 시리얼 데이터 수신 이벤트 제거 필요
    ipcRenderer.send('subscribe-to-serial', '레지스터세팅');

    const handleSerialData = (event, data) => {
      console.log(data);
      setLog(data);
      var registerValue = "";
      if(data.includes("RIB")){
        registerValue =  data.replace("RIB","").replace("0x","").replace(/ /g,'')
        setFormData((prev)=>({...prev, regValue:registerValue}));
      }
      
    };


    ipcRenderer.on('serial-data', handleSerialData);

    return () => {
      // TODO : 시리얼 데이터 수신 이벤트 제거 방법 확인 중 
      ipcRenderer.removeListener('serial-data', handleSerialData);
    };
  }, []);

  /* 3중 하나 선택 시 (인디고, Serializer, Deserializer) */
  const handleButtonClick = async (type) => {
    setDeviceType(type); // 선택한 디바이스 타입
    setHasError(false); // 기존 에러 색 제거     
    var title = ''; // 
    var tutorial = '';
    switch (type) {
      case 'serializer':
        title = '시리얼라이져';
        tutorial = '2바이트주소와 1바이트 레지스터 값 설정해주세요';
        break;
      case 'deserializer':
        title = '디시리얼라이져';
        tutorial = '2바이트주소와 1바이트 레지스터 값 설정해주세요';
        break;
      case 'indigo':
        title = 'Safety IC';
        tutorial = '4바이트주소와  레지스터 값(1,2,4바이트)를 설정해주세요';
        break;
      default:
        break;
    }
    setLog(`${title}\r\n${tutorial}`);
  };

  /* 입력 시 마다 변경 */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleByteSizeChange = (e) => {
    setByteSize(e.target.value);
  };

  /* 레지스터 읽기 */
  const readSubmit = () => {
    const updatedFormData = { ...formData, deviceType };
    readReg(updatedFormData)
      .then((response) => {
        if (response.error) {
          // 에러 발생 시
          setHasError(true);
          setLog(`${response.error}`);
        } else {
          // 정상 처리 시
          setLog(response.data);
          setHasError(false);
        }
      })
      .catch((error) => {
        setLog(`Read failed: ${error}`);
        setHasError(true);
      });
  };

  const writeSubmit = () => {
    const updatedFormData = { ...formData, deviceType };
    writeReg(updatedFormData)
      .then((response) => {
        console.log('Response from writeReg:', response);
        if (response.error) {
          setHasError(true);
          setLog(`${response.error}`);
        } else {
          setLog(response.data);
          setHasError(false);
        }
        console.log('HasError after response:', hasError);
      })
      .catch((error) => {
        setHasError(true);
        if (error.response && error.response.data && error.response.data.error) {
          setLog(error.response.data.error);
        } else {
          setLog('An unexpected error occurred');
        }
        console.log('HasError after error:', hasError);
      });
  };

  const getButtonClass = (type) => {
    return deviceType === type
      ? 'px-2 mx-1 py-3 bg-blue-700 text-white text-base rounded'
      : 'px-2 py-3 bg-blue-500 text-white text-base rounded hover:bg-blue-700';
  };

  return (
    <div className="flex flex-col items-center mt-20 scroll-mt-10 justify-start h-screen space-y-4">
      <div className="border-2  border-gray-300 rounded-sm ">
        <div className="px-16 pt-12 w-full max-w-md border-1 flex justify-center space-x-4">
          <button className={getButtonClass('serializer')} onClick={() => handleButtonClick('serializer')}>
            Serializer
          </button>
          <button className={getButtonClass('deserializer')} onClick={() => handleButtonClick('deserializer')}>
            Deserializer
          </button>
          <button className={getButtonClass('indigo')} onClick={() => handleButtonClick('indigo')}>
            Safety IC
          </button>
        </div>

        <div className="p-4 bg-gray-100 rounded shadow w-full max-w-[22] flex justify-center">
          <div className="w-full max-w-md">
            <div className="mb-4">
              <label className="block text-gray-700">레지스터 주소</label>
              <input
                type="text"
                name="regAddr"
                value={formData.regAddr}
                onChange={handleInputChange}
                className="mt-1 p-2 border rounded w-full"
              />
            </div>
            <div className="mb-4">
              {deviceType == 'indigo' ?  
                <label className="block text-gray-700">레지스터값(쓰기) / 읽을 바이트(읽기)</label>
                :<label className="block text-gray-700">레지스터 값</label>   
              }
              {/* <label className="block text-gray-700">레지스터 값</label> */}

              <input
                type="text"
                name="regValue"
                value={formData.regValue}
                onChange={handleInputChange}
                className="mt-1 p-2 border rounded w-full"
              />
            </div>
            <div className="text-center"></div>
            <div className="w-full flex justify-center gap-5">
              <button
                className="px-4 py-2 bg-green-800 text-white rounded-md shadow-sm hover:bg-green-600"
                onClick={writeSubmit}
              >
                레지스터 세팅
              </button>
              <button
                className="px-4 py-2 bg-green-800 text-white rounded-md shadow-sm hover:bg-green-600"
                onClick={readSubmit}
              >
                레지스터값 읽기
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10  bg-black  rounded shadow w-full max-w-md h-48 overflow-x-auto overflow-y-auto">
        <p className="text-sm font-bold text-red mb-2 w-full bg-white ">터미널 로그</p>
        <div>
          <pre className={`whitespace-pre-wrap font-mono ${hasError == true ? 'text-red-500' : 'text-white'}`}>
            {log}
          </pre>
        </div>
      </div>
    </div>
  );
};
