import { readReg } from '../apis/log.js'; // 레지스터 읽기, 쓰기
import React, { useState, useEffect } from 'react';

export const Monitoring = () => {
  const ipcRenderer = window.ipcRenderer;

  const [log, setLog] = useState(''); // 터미널 창 로그
  const [hasError, setHasError] = useState(false); // 에러 발생 시, 로그 텍스트 색상 변경
  const [monitoring, setMonitoring] = useState(false); // 모니터링 상태

  // 첫 번째 레지스터의 값을 관리하는 배열 (0x00 레지스터)
  const [arr, setArr] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  // 두 번째 레지스터의 값을 관리하는 배열 (0x01 레지스터)
  const [arrTwo, setArrTwo] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  // 세 번째 레지스터 값 관리 배열 (0x02 레지스터)
  const [arrThree, setArrThree] = useState([0, 0, 0, 0, 0, 0, 0, 0]);

  // 레지스터 상태 (useState로 관리)
  const [registers, setRegisters] = useState([
    {
      address: 'bit[0:7]',
      bits: [
        { name: 'DC3_OVP(3.3V)', value: 0 },
        { name: 'DC3_UVP(3.3V)', value: 0 },
        { name: 'DC2_OVP(1.8V)', value: 0 },
        { name: 'DC2_UVP(1.8V)', value: 0 },
        { name: 'DC1_OVP(1.26V)', value: 0 },
        { name: 'DC1_UVP(1.26V)', value: 0 },
        { name: '12V_OVP', value: 0 },
        { name: '12V_UVP', value: 0 },
      ],
    },
    {
      address: 'bit[8:15]',
      bits: [
        { name: 'LVDS_NO Signal', value: 0 },
        { name: 'VIDEO FREEZE', value: 0 },
        { name: 'LCD FAIL', value: 0 },
        { name: 'LED FAIL', value: 0 },
        { name: 'DC5_OVP(13V)', value: 0 },
        { name: 'DC5_UVP(13V)', value: 0 },
        { name: 'DC4_OVP(5V)', value: 0 },
        { name: 'DC4_UVP(5V)', value: 0 },
      ],
    },
    {
      address: 'bit[16:23]',
      bits: [
        { name: '-', value: 0 },
        { name: '-', value: 0 },
        { name: 'FW Update', value: 0 },
        { name: 'RAM ECC ERROR', value: 0 },
        { name: 'Flash ECC ERROR', value: 0 },
        { name: 'SM_IMG_CRC', value: 0 },
        { name: 'NM_IMG_CRC', value: 0 },
        { name: 'WL_CRC ERROR', value: 0 },
      ],
    },
  ]);

  // registers 상태를 업데이트하는 useEffect
  useEffect(() => {
    setRegisters((prevRegisters) =>
      prevRegisters.map((register, index) => ({
        ...register,
        bits: register.bits.map((bit, bitIndex) => ({
          ...bit,
          value: index === 0 ? arr[bitIndex] : index === 1 ? arrTwo[bitIndex] : arrThree[bitIndex],
        })),
      }))
    );
  }, [arr, arrTwo, arrThree]);

  const hexToBinaryArray = (hexString) => {
    let binaryString = parseInt(hexString, 16).toString(2).padStart(8, '0');
    return binaryString.split('').map((bit) => parseInt(bit));
  };

  const generateRandomHexData = () => {
    let hexArray = [];
    for (let i = 0; i < 4; i++) {
      let randomHex = Math.floor(Math.random() * 256)
        .toString(16)
        .toUpperCase();
      hexArray.push(`0x${randomHex.padStart(2, '0')}`);
    }
    return hexArray.join(' ');
  };

  // const testData = () => {
  //   var data = generateRandomHexData(); // 랜덤한 데이터 생성
  //   console.log('Generated Data:', data);

  //   if (data.includes('0x')) {
  //     let hexArray = data.split(/\s+/).map((hex) => hex.replace('0x', ''));
  //     let binArray = hexArray.map(hexToBinaryArray);

  //     setArr(binArray[0]);
  //     setArrTwo(binArray[1]);
  //     setArrThree(binArray[2]);
  //   }
  // };

  const testData = () => {
    var data = '0x00 0x00 0x00 0x02';
    if (data.includes('0x')) {
      let hexArray = data.split(/\s+/).map((hex) => hex.replace('0x', ''));
      let binArray = hexArray.map(hexToBinaryArray);

      setArr(binArray[3]);
      setArrTwo(binArray[2]);
      setArrThree(binArray[1]);
    }
  };

  useEffect(() => {
    let interval;
    // 1초 타이머로 모니터링링
    if (monitoring) {
      interval = setInterval(() => {
        //testData();

        var receivedCmd = { cmd: 'm' };
        readReg(receivedCmd)
          .then((response) => {
            if (response.error) {
              setHasError(true);
              setLog(`${response.error}`);
            } else {
              setLog(response.data);
              setHasError(false);
            }
          })
          .catch((error) => {
            setLog(`Read failed: ${error}`);
            setHasError(true);
          });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [monitoring]);

  useEffect(() => {
    // 경고등 페이지 , mcu 데이터 구독 요청
    ipcRenderer.send('subscribe-to-serial', 'alarm');
    // 추가
    const handleSerialData = (event, data) => {
      console.log(data);
      //var data = '0x00 0x00 0x00 0x02';
      if (data.includes('0x')) {
        let hexArray = data.split(/\s+/).map((hex) => hex.replace('0x', ''));
        let binArray = hexArray.map(hexToBinaryArray);

        setArr(binArray[3]);
        setArrTwo(binArray[2]);
        setArrThree(binArray[1]);
      }
    };
    ipcRenderer.on('serial-data', handleSerialData);
    return () => {
      ipcRenderer.removeListener('serial-data', handleSerialData);
    };
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">System Fault 모니터링</h1>

      <div className="flex gap-4 mb-4">
        <button
          className="bg-green-500 text-white py-2 px-4 rounded"
          onClick={() => setMonitoring(true)}
          disabled={monitoring}
        >
          Monitoring 시작
        </button>
        <button
          className="bg-red-500 text-white py-2 px-4 rounded"
          onClick={() => setMonitoring(false)}
          disabled={!monitoring}
        >
          Monitoring 중지
        </button>
      </div>
      {/* 모니터링 활성화 */}
      {monitoring ? (
        <div className="grid grid-cols-1 gap-6">
          {registers.map((register, index) => (
            <div key={index} className="bg-white shadow p-4 rounded">
              <h2 className="text-xl font-semibold mb-2">Register: {register.address}</h2>
              <div className="grid grid-cols-8 gap-2">
                {register.bits.map((bit, bitIndex) => (
                  <div
                    key={bitIndex}
                    className={`p-2 ${
                      bit.name !== '-' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-400'
                    } rounded`}
                  >
                    <span>{bit.name}</span>
                    <div className="mt-1">
                      <span className="font-bold">Value: {bit.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <p className="text-gray-500">Sys Fault 모니터링이 중지되었습니다.</p>
          <p className="text-gray-500">모니터링을 원하시면 시작 버튼을 클릭하세요.</p>
        </>
      )}
    </div>
  );
};
