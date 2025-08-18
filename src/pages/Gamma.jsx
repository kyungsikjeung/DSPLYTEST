import React, { useState, useEffect, useRef } from 'react';
import { measureLuminance, downloadGamma, cleanLogFile,getData } from '../apis/serial';

export const Gamma = () => {
  const [log, setLog] = useState('');
  const greyIndexRef = useRef(0);
  const taskRef = useRef(null);
  const [data, setData] = useState([]); // Array of measurement sets
  const [selectedSetIdx, setSelectedSetIdx] = useState(0); // Index of selected measurement set
  const [measureNum, setMeasureNum] = useState(1); // Index of selected measurement set
  const [selectedTrial, setSelectedTrial] = useState('all');



  const getFormattedTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}:${milliseconds}`;
  };
  
  const getDataAsync = async () => {
    try {
      const data = await getData();
      console.log('Received data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    (async () => {
  const measuredData = await getDataAsync();
  console.log('measuredData:', measuredData); // Debug the structure
  // If measuredData is array of sets, setData to that array
  setData(Array.isArray(measuredData) ? measuredData : []);
    })();
    return () => {
      if (taskRef.current) {
        clearInterval(taskRef.current);
        taskRef.current = null;
      }
    };
  }, []);

  const downloadLog = () => {
    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'log.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteLog = () => {
    setLog('');
  };

  let greyIndex = 0;
  let measurementCnt = 0;

  const taskProcess = async () => {
    if (greyIndex >= 256) {
      greyIndex = 255;
    }

    const msg = `Grey ${greyIndex}`;
    window.color?.send('grey', greyIndex);
    console.log('감마 측정하기');
    setLog((prev) => `[${getFormattedTime()}] ${msg}\n`);

    await measureLuminance();
    greyIndex = greyIndex == 255 ? 0 : greyIndex + 4;
    measurementCnt++;
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const cleanTextFile = async () => {
    await cleanLogFile();
    setLog('텍스트 파일이 비워졌습니다.');
    console.log('텍스트 파일이 비워졌습니다.');
  }

  const dataDetail = async () => {
  setLog('상세 데이터 확인');
  const measuredData = await getDataAsync();
  console.log('measuredData:', measuredData); // Debug the structure
  setData(Array.isArray(measuredData) ? measuredData : []);
  setSelectedSetIdx(0);
  console.log('상세 데이터 확인');
  };

  // Dynamic trial selection handler
  const getRawData = async () => {
    setLog('raw 데이터가져오기');
    console.log('raw 데이터가져오기');
    const data = await getData();
    // You can fetch or update raw data here if needed
  }


  const getMeasurementData = async () => {
    setLog('측정 데이터 가져오기');
    console.log('측정 데이터 가져오기');
    const data = await getData();
    // You can fetch or update measurement data here if needed
  }

  let isMeasurementFinished = false;
  const measureGamma = async () => {
    window.newWindow?.open('colorratiosubwindow');
    greyIndex = 0; // 4씩 증가
    measurementCnt = 0; // 측정 횟수 초기화
    const numofDataTobemeasured = measureNum * 65;
    console.log('numofDataTobemeasured:', numofDataTobemeasured);
    await cleanLogFile();
    await sleep(1000);
    
    if (!taskRef.current) {

      taskRef.current = setInterval(async () => {
        await taskProcess();
        console.log('measurementCnt:', measurementCnt);
        if (measurementCnt == numofDataTobemeasured) {
          clearInterval(taskRef.current);
          taskRef.current = null;
          greyIndex = 0;

          //setLog((prev) => `Gray 255\n`);
          setTimeout(() => {
            window.newWindow?.close();
          }, 1000);
          setLog((prev) => prev + `감마 측정 완료\n`);
        }
      }, 800);
    }
  };

  const downloadGammaXlsx = async () => {
    try {
      const arrayBuffer = await downloadGamma();  // ArrayBuffer 받음
      console.log('Received ArrayBuffer:', arrayBuffer.byteLength, 'bytes');
      
      const blob = new Blob([arrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      console.log('Created Blob:', blob.size, 'bytes');
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gamma_measurement.xlsx';
      document.body.appendChild(a);  // DOM에 추가
      a.click();
      document.body.removeChild(a);  // DOM에서 제거
      URL.revokeObjectURL(url);
      
      console.log('파일 다운로드 완료');
    } catch (error) {
      console.error('다운로드 실패:', error);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-2 py-4 space-y-4">
      <div className="flex flex-wrap justify-center gap-2 w-full">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mx-2 my-1"
          onClick={measureGamma}
        >
          감마 측정하기
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mx-2 my-1"
          onClick={downloadGammaXlsx}
        >
          감마 측정 결과 다운로드
        </button>
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mx-2 my-1"
          onClick={dataDetail}
        >
          상세 데이터 확인
        </button>
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mx-2 my-1"
          onClick={cleanTextFile}
        >
          상세 데이터 다운로드
        </button>
      </div>

        <div className="mb-2">
              <label htmlFor="set-select" className="mr-2 font-bold">감마 측정 횟수:</label>
              <select
                id="set-select"
                className="border rounded px-8 py-1"
                value={measureNum}
                onChange={e => setMeasureNum(Number(e.target.value))}
              >
                <option key={1} value={1}>{`${1}회`}</option>
                <option key={2} value={2}>{`${2}회`}</option>
                <option key={3} value={3}>{`${3}회`}</option>
                <option key={4} value={4}>{`${4}회`}</option>
                <option key={5} value={5}>{`${5}회`}</option>
              </select>
      </div>  

      <div className="w-full max-w-3xl">
        <div className="bg-black rounded shadow min-h-32 max-h-60 overflow-y-auto mb-4">
          <p className="text-sm font-bold text-red mb-2 w-full bg-white sticky top-0">
            측정 현황
          </p>
          <div className="overflow-y-auto">
            <pre className="whitespace-pre-wrap font-mono text-white">
              {log && log.trim() ? log : "로그가 없습니다"}
            </pre>
          </div>
        </div>
        
        {/* 감마 1회~5회 셀렉트 및 테이블 */}
        {data && data.length > 0 ? (
          <div className="mt-4 w-full">
            {data.length > 1 && (
              <div className="mb-2">
                <label htmlFor="set-select" className="mr-2 font-bold">감마 측정 결과 선택:</label>
                <select
                  id="set-select"
                  className="border rounded px-2 py-1"
                  value={selectedSetIdx}
                  onChange={e => setSelectedSetIdx(Number(e.target.value))}
                >
                  {data.slice(0, 5).map((set, idx) => (
                    <option key={idx} value={idx}>{`감마 ${idx + 1}회`}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Show table if measurements exist */}
            {data[selectedSetIdx] && Array.isArray(data[selectedSetIdx].measurements) && data[selectedSetIdx].measurements.length > 0 ? (
              <table className="min-w-full bg-white mt-4">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">계조</th>
                    <th className="py-2 px-4 border-b">휘도</th>
                    <th className="py-2 px-4 border-b">감마</th>
                  </tr>
                </thead>
                <tbody>
                  {data[selectedSetIdx].measurements.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-4 border-b">{item.gradation}</td>
                      <td className="py-2 px-4 border-b">{item.luminance}</td>
                      <td className="py-2 px-4 border-b">{item.gamma !== null ? item.gamma : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-gray-500 py-8">데이터가 없습니다</div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">데이터가 없습니다</div>
        )}
      </div>
    </div>
  );
};
