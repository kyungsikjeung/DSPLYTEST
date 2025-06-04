import React, { useState, useEffect } from 'react';
import { readReg } from '../apis/log.js';

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

export function AlarmCRC() {
  const [log, setLog] = useState(''); // 터미널 창 로그
  
  // 초기 경고등 데이터
  const initialWarnings = [
    { id: 0, title: '경고등 1', description: '핸들 오류', imageSrc: img1, x: 5260, y:67, crcError: 0 },
    { id: 1, title: '경고등 2', description: '배터리 저 전압', imageSrc: img2, x: 5314, y:67, crcError: 0 },
    { id: 2, title: '경고등 3', description: '도어 열림', imageSrc: img3, x: 5374, y:67, crcError: 0 },
    { id: 3, title: '경고등 4', description: '냉각수 과열', imageSrc: img4, x: 5437, y:67, crcError: 0 },
    { id: 4, title: '경고등 5', description: '에어백 경고등', imageSrc: img5, x: 5503, y:67, crcError: 0 },
    { id: 5, title: '경고등 6', description: '안전 벨트', imageSrc: img6, x: 5520, y:67, crcError: 0 },
    { id: 6, title: '경고등 7', description: '주차 브레이크', imageSrc: img7, x: 5569, y:67, crcError: 0 },
    { id: 7, title: '경고등 8', description: '엔진오일 압력', imageSrc: img8, x: 5630, y:67, crcError: 0 },
    { id: 8, title: '경고등 9', description: '마스터 경고', imageSrc: img9, x: 3400, y: 1385, crcError: 0 },
    { id: 9, title: '경고등 10', description: '서비스 경고', imageSrc: img10, x: 3450, y: 1385, crcError: 0 },
    { id: 10, title: '경고등 11', description: '엔진 경고등', imageSrc: img11, x: 3584, y: 1385, crcError: 0 },
    { id: 11, title: '경고등 12', description: '연료 부족', imageSrc: img12, x: 3642, y: 1385, crcError: 0 },
    { id: 12, title: '경고등 13', description: '차체 자세 제어', imageSrc: img13, x: 3705, y: 1385, crcError: 0 },
    { id: 13, title: '경고등 14', description: '자세 제어 OFF', imageSrc: img14, x: 100, y: 1385, crcError: 0 },
    { id: 14, title: '경고등 15', description: '방향 지시등(좌)', imageSrc: img15, x: 3175, y: 1310, crcError: 0 },
    { id: 15, title: '경고등 16', description: '방향 지시등(우)', imageSrc: img16, x: 3859, y: 1310, crcError: 0 },
  ];

  // 경고등 상태를 전체 관리
  const [warnings, setWarnings] = useState(initialWarnings);

  // -------------------------------
  // 1) 현재 마우스 좌표 관리 state
  // -------------------------------
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);

 

  // X 좌표 수정 핸들러
  const handleXChange = (index, newX) => {
    setWarnings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], x: Number(newX) };
      return updated;
    });
  };

  // Y 좌표 수정 핸들러
  const handleYChange = (index, newY) => {
    setWarnings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], y: Number(newY) };
      return updated;
    });
  };

  const executeCmd = (cmdText) => {
    const receivedCmd = { cmd: cmdText };
    readReg(receivedCmd)
      .then((response) => {
        const timeStamp = getFormattedTime();
        if (response.error) {
          //setHasError(true);
          setLog(prev => prev + `[${timeStamp}] ${response.error}\n`);
        } else {
          //setHasError(false);
          setLog(prev => prev + `[${timeStamp}] ${response.data}\n`);
        }
      })
      .catch((error) => {
        const timeStamp = getFormattedTime();
        //setHasError(true);
        setLog(prev => prev + `[${timeStamp}] Read failed: ${error}\n`);
      });
  };

  // CRC 에러 발생/해제 (단 한 개만 가능)
  const handleCrcToggle = (index) => {
    setWarnings((prev) => {
      // 복사 후 전체를 먼저 CRC 에러 해제(0)
      let updated = prev.map((warn) => ({ ...warn, crcError: 0 }));

      // 선택한 항목이 원래 켜져 있었는지(1) 확인
      const wasOn = prev[index].crcError === 1;

      if (!wasOn) {
        // 기존에 꺼져 있으면 → 켜기
        updated[index].crcError = 1;
        // 켜지는 순간 X/Y 좌표 콘솔 출력
        var time = getFormattedTime();
        console.log(time);
        // const gara = "[09:30:21:952] 경고등 ID 1 CRC 에러 클릭\n"
        // const gararesponse = "[09:30:50:952] SYS FAULT 발생\n WR_CRC_에러확인"
        // const garawriting = gara + gararesponse;
        // setLog((prevLog) => prevLog + garawriting);
        // setLog("")
        setLog((prevLog) => prevLog +   `[${time}] 경고등 ID ${index+1} CRC 에러 클릭\n`);
        var randomDelay = Math.floor(Math.random() * 26) + 450; 
        //setTimeout(() => {
          //const time = getFormattedTime();
          
          //setLog(prevLog => prevLog + `[${time}]SYS_FAULT\n`);
        //}, randomDelay);
        setTimeout(() => {
          executeCmd("almr4 0x60000F40");
        }, 1000);

        //setLog((prevLog) => prevLog +   `[${time}] 경고등 ID ${index+1} CRC 에러 클릭\n`);
        // setLog((prevLog) => prevLog + `(X = ${updated[index].x}, Y = ${updated[index].y})`)
        console.log(`경고등 ID ${index+1} CRC 에러 ON (X = ${updated[index].x}, Y = ${updated[index].y})`);
        mouse.Move({x:updated[index].x, y:updated[index].y})
      } else {
        // 이미 켜져 있던 경우 → 끄기
        console.log(`경고등 ID ${index} CRC 에러 OFF`);
      }

      return updated;
    });
  };

  const crcErrorStatus = () => {
    const timeStamp = getFormattedTime();
    setLog((prevLog) => prevLog + `[${timeStamp}] CRC 에러 상태 확인\n`);
    executeCmd("almr4 0x60000F40");
  }

  // 로그 다운로드
  const downloadLog = () => {
    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'log.txt';
    a.click();
    URL.revokeObjectURL(url);
  };
  // 로그 지우기
  const deleteLog = () => {
    setLog('');
  }
  // 로그 타임 스템프 
  const getFormattedTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}:${milliseconds}`;
  };

   useEffect(() => {
      ipcRenderer.send('subscribe-to-serial', '레지스터세팅');
  
      const handleSerialData = (event, data) => {
        var timeStamp = getFormattedTime();
        setLog((prevLog) => prevLog +'['+timeStamp + '] ' + data + '\n');
      };
  
      ipcRenderer.on('serial-data', handleSerialData);
      // 마우스 시작. 
      mouse.StartGet();
      mouse.monitor((pos)=>{
       
        setCurrentX(pos.x);
        setCurrentY(pos.y);
        //setLog(pos.x);
      });

      // 키 눌를 시  -> F2
      const handleKeyDown = (e) => {
        if (e.key === 'F2') {
           executeCmd("almr4 0x60000F40");
        }else if(e.key == 'F3'){
          setLog("");
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        mouse.StopGet();
        ipcRenderer.removeListener('serial-data', handleSerialData);
        window.removeEventListener('keydown', handleKeyDown);

      };
    }, []);


  return (
    // 3) 마우스 이동 이벤트를 전체 컨테이너에 등록
    <div
      className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8"
    
    >

      {/* 상단 안내 */}
      <div className="text-center mb-8">
        <div className="text-white font-bold text-3xl">경고등 CRC 에러 </div>
        <p className="text-white mt-2">   각 경고등의 CRC 에러발생 버튼을 눌러 에러를 발생시킵니다   </p>
        
        {/*  */}
       <div className="flex flex-col mt-0 scroll-mt-10 items-center space-y-4">
      <div className="mt-10 bg-black rounded shadow w-full h-96 overflow-hidden">
        <p className="text-sm font-bold text-red mb-2 w-full bg-white sticky top-0">터미널 로그</p>
        <div className="text-start overflow-y-auto h-full">
          <pre className={`whitespace-pre-wrap font-mono  text-white`}>
            {log}
          </pre>
        </div>
      </div>
      <div>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded mx-1"
          onClick={crcErrorStatus}
        >
          CRC에러상태확인
        </button>
        <button
          className="bg-green-500 text-white py-2 px-4 rounded mx-1"
          onClick={downloadLog}
        >
          로그 다운로드 받기 
        </button>
        <button
          className="bg-red-500 text-white py-2 px-4 rounded mx-1"
          onClick={deleteLog}
        >
          로그 지우기 
        </button>

      </div>
      <div>
        {/* <input   className='px-20 mt-2 mr-4' type="text"  id="cmd" name="cmd" value={cmd} /> */}
        
       
      </div>
    </div>
        {/*  */}
        

        {/* 4) 현재 마우스 좌표 표시 (예시) */}
        <div className="text-white mt-4">
          현재 마우스 좌표: (X = {currentX}, Y = {currentY})
        </div>
      </div>

      {/* 경고등 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {warnings.map((light, index) => (
          <div key={light.id} className="bg-gray-800 rounded-lg p-4 text-center shadow-lg transform">
            <img src={light.imageSrc} alt={light.title} className="w-full h-32 object-none rounded-md mb-4" />
            <div className="font-bold text-white mb-1">{light.title}</div>
            <p className="text-gray-400 text-sm mb-4">{light.description}</p>

            {/* X 좌표 입력 */}
            <div className="mb-2">
              <label className="text-white mr-2">X좌표:</label>
              <input
                type="number"
                value={light.x}
                onChange={(e) => handleXChange(index, e.target.value)}
                className="w-20 px-2 py-1 rounded"
              />
            </div>

            {/* Y 좌표 입력 */}
            <div className="mb-4">
              <label className="text-white mr-2">Y좌표:</label>
              <input
                type="number"
                value={light.y}
                onChange={(e) => handleYChange(index, e.target.value)}
                className="w-20 px-2 py-1 rounded"
              />
            </div>

            {/* CRC 에러 토글 버튼 (하나만 가능) */}
            <button
              onClick={() => handleCrcToggle(index)}
              className={`w-full py-2 rounded-full text-white font-bold transition-colors ${
                light.crcError === 1 ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {light.crcError === 1 ? 'CRC 에러 해제' : 'CRC 에러 발생'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
