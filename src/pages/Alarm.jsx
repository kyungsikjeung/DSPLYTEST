import React, { useState, useEffect } from 'react';
import { readAlarm, applyAlarm } from '../apis/alarm.js';

import img1 from '../assets/images/n1.png';
import img2 from '../assets/images/n2.png';
import img3 from '../assets/images/n3.png';
import img4 from '../assets/images/n4.png';
import img5 from '../assets/images/n5.png';
import img6 from '../assets/images/n6.png';
import img7 from '../assets/images/n7.png';
import img8 from '../assets/images/n8.png';
import img9 from '../assets/images/n9.png';
import img10 from '../assets/images/n10.png';
import img11 from '../assets/images/n11.png';
import img12 from '../assets/images/n12.png';
import img13 from '../assets/images/n13.png';
import img14 from '../assets/images/n14.png';
import img15 from '../assets/images/n15.png';
import img16 from '../assets/images/n16.png';


/*
* @brief Normal Mode, Safety Mode 경고등 제어
*/
export function Alarm() {
  const [activeWarning, setActiveWarning] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [reverseActiveWarning, setReverseActiveWarning] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [normalMode, setNormalMode] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // 경고등 페이지 , mcu 데이터 구독 요청 
    ipcRenderer.send('subscribe-to-serial', 'alarm');
    // 추가
    const handleSerialData = (event, data) => {
      console.log(data);
      //setLog(data);
      //var registerValue = "";
      if(data.includes("RIB")){
        //registerValue =  data.replace("RIB","").replace("0x","").replace(/ /g,'')
        //setFormData((prev)=>({...prev, regValue:registerValue}));
      }
      
    };
    ipcRenderer.on('serial-data', handleSerialData);
    return () => {
      ipcRenderer.removeListener('serial-data', handleSerialData);
    }
  }, []);
  /* 모드 변경 NormalMode <-> Safety Mdoe */
  const changeMode = () => {
    setNormalMode((prev) => !prev);
    setActiveWarning([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setReverseActiveWarning([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  };

  /* 경고등 상태 변경(UI Binding) */
  const updateWarning = (index, value) => {
    console.log("test")
    setActiveWarning((prevState) => {
      const newState = [...prevState];
      newState[index] = value;
      return newState;x 
    });
    setReverseActiveWarning((prevState) => {
      const newState = [...prevState];
      newState[15-index] = value;
      return newState;
    });
    //var temp = [...activeWarning];
    //temp.reverse();
    //setReverseActiveWarning(temp);
      
     // [...activeWarning].reverse());
     console.log('reverseActiveWarning');
    console.log(reverseActiveWarning);
  };

  /* 경고등 클릭 시, 현재 상태 확인 후 토글 : ON/OFF 상태 변경  */
  const handleWarningClick = async (index) => {
    var toggleVal = activeWarning[index] ? 0 : 1;
    
    updateWarning(index, toggleVal);
  };
  /* 200ms 마다 특정 작업 시작  */
  const senarioClick = () => {  
    setTimeout(() => {
      // !TODO: 테스트용 코드,  스케쥴링 작업
      console.log('테스트2');
    }, 200);
  };

  /* 경고등 제어 버튼  */
  const applyClick = () => {
    var arrayMsbToLsb = [...activeWarning];
    arrayMsbToLsb.reverse();
    var strigifyAlarmData = JSON.stringify(arrayMsbToLsb); // LSB 변경
    console.log(strigifyAlarmData);
    var modifiedDataObj = { mode : normalMode ? 'normal': 'safety' , alarmData: strigifyAlarmData };
    applyAlarm(modifiedDataObj)
      .then((response) => {
        if(response.error){
          console.log(response.error); // 에러 로그
        }else{
          console.log(response.data); // 성공 로그
        }
      })
      .catch((error) => { 
         console.log(error); // 에러 로그
      });
  };
  /* 경고등 제어 상태 확인 버튼 */
  const readClick = () => {
    var modifiedDataObj = { mode : normalMode ? 'normal': 'safety' };
    readAlarm(modifiedDataObj)
    .then((response) => {
      if(response.error){
        console.log(response.error); // 에러 로그
      }else{
        console.log(response.data); // 성공 로그
      }
    })
    .catch((error) => { 
       console.log(error); // 에러 로그
    });
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };



  // Safety Mode에서 경고등
  const safetyLight = [
    {
      id: 0,
      title: '안전 경고등 1',
      description: '핸들 오류',
      imageSrc: img1,
    },
    {
      id: 1,
      title: '안전 경고등 2',
      description: '배터리 저 전압',
      imageSrc: img2,
    },
    {
      id: 2,
      title: '안전 경고등 3',
      description: '도어 열림',
      imageSrc: img3,
    },
    {
      id: 3,
      title: '안전 경고등 4',
      description: '냉각수 과열',
      imageSrc: img4,
    },
    {
      id: 4,
      title: '안전 경고등 5',
      description: '에어백 경고등',
      imageSrc: img5,
    },
    {
      id: 5,
      title: '안전 경고등 6',
      description: '안전 벨트',
      imageSrc: img6,
    },
    {
      id: 6,
      title: '안전 경고등 7',
      description: '엔진오일 압력',
      imageSrc: img7,
    },
    {
      id: 7,
      title: '안전 경고등 8',
      description: '안전 Mode 경고등설명 8',
      imageSrc: img8,
    },
    {
      id: 8,
      title: '안전 경고등 9',
      description: '마스터 경고',
      imageSrc: img9,
    },
    {
      id: 9,
      title: '안전 경고등 10',
      description: '서비스 경고',
      imageSrc: img10,
    },
    {
      id: 10,
      title: '안전 경고등 11',
      description: '엔진 경고등',
      imageSrc: img11,
    },
    {
      id: 11,
      title: '안전 경고등 12',
      description: '연료 부족',
      imageSrc: img12,
    },
    {
      id: 12,
      title: '안전 경고등 13',
      description: '차체 자세 제어',
      imageSrc: img13,
    },
    {
      id: 13,
      title: '안전 경고등 14',
      description: '차체 자세 제어 OFF',
      imageSrc: img14,
    },
    {
      id: 14,
      title: '안전 경고등 15',
      description: '방향 지시등(좌)',
      imageSrc: img15,
    },
    {
      id: 15,
      title: '안전 경고등 16',
      description: '방향 지시등(우)',
      imageSrc: img16,
    },
  ];

  // normal mode에서 경고등
  const warningLights = [
    {
      id: 0,
      title: '경고등 1',
      description: '핸들 오류',
      imageSrc: img1,
    },
    {
      id: 1,
      title: '경고등 2',
      description: '배터리 저 전압',
      imageSrc: img2,
    },
    {
      id: 2,
      title: '경고등 3',
      description: '도어 열림',
      imageSrc: img3,
    },
    {
      id: 3,
      title: '경고등 4',
      description: '냉각수 과열',
      imageSrc: img4,
    },
    { id: 4, title: '경고등 5', description: '에어백 경고등', imageSrc: img5 },
    { id: 5, title: '경고등 6', description: '안전 벨트', imageSrc: img6 },
    { id: 6, title: '경고등 7', description: '주차 브레이크', imageSrc: img7 },
    { id: 7, title: '경고등 8', description: '엔진오일 압력', imageSrc: img8 },
    { id: 8, title: '경고등 9', description: '서비스 경고', imageSrc: img10 },
    { id: 9, title: '경고등 10', description: '엔진 경고등', imageSrc: img11 },
    { id: 10, title: '경고등 11', description: '마스터 경고', imageSrc: img9 },
    { id: 11, title: '경고등 12', description: '연료 부족', imageSrc: img12 },
    { id: 12, title: '경고등 13', description: '차체 자세 제어', imageSrc: img13 },
    { id: 13, title: '경고등 14', description: '차체 자세 제어 OFF', imageSrc: img14 },
    { id: 14, title: '경고등 15', description: '방향 지시등(좌)', imageSrc: img15 },
    { id: 15, title: '경고등 16', description: '방향 지시등(우)', imageSrc: img16 },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <div className="text-white font-bold text-3xl">경고등 패널</div>
        <p className="text-white mt-2">
          모드를 변경한 후, + 버튼을 눌러 경고등을 클릭하여 활성화하고 레지스터 상태를 확인하세요.
        </p>
        {/* <div className="flex items-center justify-center mt-4">
          <span className="text-white mr-2">Normal Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={!normalMode} onChange={changeMode} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-white ml-2">Safety Mode</span>
        </div> */}
      </div>

      <div className="flex justify-center w-full mb-4">
        <div className="flex items-center mr-4">
          <div className="w-4 h-4 bg-red-600 mr-2 rounded-full"></div>
          <span className="text-white">꺼진 상태</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-600 mr-2 rounded-full"></div>
          <span className="text-white">켜진 상태</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {normalMode
          ? warningLights.map((light, index) => (
              <div
                key={light.id}
                className={`bg-gray-800 min-w-[190px] rounded-lg p-4 text-center shadow-lg transition-transform transform ${
                  activeWarning[index] === 1 ? 'scale-105' : ''
                }`}
              >
                <img src={light.imageSrc} alt={light.title} className="w-full h-32 object-none rounded-md mb-4" />
                <div className="font-bold text-white mb-2">{light.title}</div>
                <p className="text-gray-400 text-sm mb-4">{light.description}</p>
                <button
                  onClick={() => handleWarningClick(index)}
                  className={`w-full py-2 rounded-full text-white font-bold transition-colors ${
                    activeWarning[index] === 1 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {activeWarning[index] === 0 ? '경고등 켜기' : '경고등 끄기'}
                </button>
              </div>
            ))
          : safetyLight.map((light, index) => (
              <div
                key={light.id}
                className={`bg-gray-800 min-w-[190px]  rounded-lg p-4 text-center shadow-lg transition-transform transform ${
                  activeWarning[index] === 1 ? 'scale-105' : ''
                }`}
              >
                <img src={light.imageSrc} alt={light.title} className="w-full h-32 object-none rounded-md mb-4" />
                <div className="font-bold text-white mb-2">{light.title}</div>
                <p className="text-gray-400 text-sm mb-4">{light.description}</p>
                <button
                  onClick={() => handleWarningClick(index)}
                  className={`w-full py-2 rounded-full text-white font-bold transition-colors ${
                    activeWarning[index] === 1 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {activeWarning[index] === 0 ? '경고등 켜기' : '경고등 끄기'}
                </button>
              </div>
            ))}
      </div>

      <button
        onClick={handleToggleExpand}
        className="fixed bottom-4 right-12 py-2 px-4 bg-blue-600 text-white font-bold rounded-full transition-transform transform active:scale-95"
      >
        {isExpanded ? 'X' : '+'}
      </button>

      {isExpanded && (
        <div className="fixed bottom-16 right-12 flex flex-col items-center space-y-2">
          <button
            onClick={senarioClick}
            className="py-2 px-4 bg-gray-400 text-white font-bold rounded-full transition-transform transform active:scale-95"
          >
            적용 후 200ms 후 상태 체크
          </button>

          <button
            onClick={readClick}
            className="py-2 px-4 bg-blue-600 text-white font-bold rounded-full transition-transform transform active:scale-95"
          >
            적용상태 확인
          </button>
          <button
            onClick={applyClick}
            className="py-2 px-4 bg-green-600 text-white font-bold rounded-full transition-transform transform active:scale-95"
          >
            적용하기
          </button>
        </div>
      )}

      <div className="text-white mt-8">{activeWarning !== null ? `경고등 상태 ${reverseActiveWarning}` : ''}</div>
    </div>
  );
}
