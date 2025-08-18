import React, { useState, useEffect, useRef } from 'react';
import { measureLuminance, downloadGamma, cleanLogFile,getData } from '../apis/serial';

export const Gamma = () => {
  const [log, setLog] = useState('');
  const greyIndexRef = useRef(0);
  const taskRef = useRef(null);
  const [data, setData] = useState([]);
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
      const gradation = measuredData && measuredData["gradation_step:1"];
      setData(gradation && gradation.data && gradation.data.measurements ? gradation.data.measurements : []);
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

  const taskProcess = async () => {
    if (greyIndex >= 256) {
      greyIndex = 255;
    }

    const msg = `Grey ${greyIndex}`;
    window.color?.send('grey', greyIndex);
    console.log('감마 측정하기');
    setLog((prev) => `[${getFormattedTime()}] ${msg}\n`);

    await measureLuminance();
    greyIndex += 4;
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const cleanTextFile = async () => {
    await cleanLogFile();
    setLog('텍스트 파일이 비워졌습니다.');
    console.log('텍스트 파일이 비워졌습니다.');
  }

  const dataDetail = async () => {
    setLog('상세 데이터 확인');
//    const data = await getData();
      const measuredData = await getDataAsync();
      console.log('measuredData:', measuredData); // Debug the structure
      const gradation = measuredData && measuredData["gradation_step:1"];
      setData(gradation && gradation.data && gradation.data.measurements ? gradation.data.measurements : []);
      console.log('상세 데이터 확인');
  };

  // Dynamic trial selection handler
  const getRawData = async () => {
    setLog('raw 데이터가져오기');
    console.log('raw 데이터가져오기');
    const data = await getData();
    // You can fetch or update raw data here if needed
  }


  const measureGamma = async () => {
    window.newWindow?.open('colorratiosubwindow');
    greyIndex = 0;
    await cleanLogFile();
    await sleep(3000);

    if (!taskRef.current) {
      taskRef.current = setInterval(async () => {
        await taskProcess();
        if (greyIndex > 256) {
          clearInterval(taskRef.current);
          taskRef.current = null;
          greyIndex = 0;

          setLog((prev) => `Gray 255\n`);
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
    <div className="flex flex-col mt-0 scroll-mt-10 items-center h-screen space-y-4">
      <div>
        {/* Add measure icon */}
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
      <div className="bg-black rounded shadow w-3/5 h-60 overflow-hidden">
        <p className="text-sm font-bold text-red mb-2 w-full bg-white sticky top-0">
          측정 현황
        </p>
        <div className="overflow-y-auto h-full">
          <pre className="whitespace-pre-wrap font-mono text-white">{log}</pre>
        </div>
      </div>

      {/* Trial selector UI */}
      {data && data.length > 0 && (
        <div className="mt-4 w-3/5">
          <label htmlFor="trial-select" className="mr-2 font-bold">트라이얼 선택:</label>
          <select
            id="trial-select"
            className="border rounded px-2 py-1"
            value={selectedTrial}
            onChange={e => setSelectedTrial(e.target.value)}
          >
            <option value="all">모두 보기</option>
            {/* Dynamically list trials based on data */}
            {(() => {
              // Find max trial count
              const maxTrials = Math.max(...data.map(item => item.trials ? item.trials.length : 1));
              return Array.from({ length: maxTrials }, (_, i) => (
                <option key={i} value={`trial${i + 1}`}>{`트라이얼 ${i + 1}`}</option>
              ));
            })()}
          </select>

          <table className="min-w-full bg-white mt-4">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">순번</th>
                {/* If all, show trial columns side by side */}
                {selectedTrial === 'all'
                  ? (() => {
                      const maxTrials = Math.max(...data.map(item => item.trials ? item.trials.length : 1));
                      return Array.from({ length: maxTrials }, (_, i) => (
                        <React.Fragment key={i}>
                          <th className="py-2 px-4 border-b">계조 (T{i + 1})</th>
                          <th className="py-2 px-4 border-b">휘도 (T{i + 1})</th>
                          <th className="py-2 px-4 border-b">감마 (T{i + 1})</th>
                        </React.Fragment>
                      ));
                    })()
                  : [<th key="grayIndex" className="py-2 px-4 border-b">계조</th>,
                     <th key="luminance" className="py-2 px-4 border-b">휘도</th>,
                     <th key="gamma" className="py-2 px-4 border-b">감마</th>]
                }
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">{item.id}</td>
                  {selectedTrial === 'all'
                    ? (() => {
                        const maxTrials = Math.max(...data.map(it => it.trials ? it.trials.length : 1));
                        return Array.from({ length: maxTrials }, (_, i) => {
                          const trial = item.trials && item.trials[i];
                          return trial ? (
                            <React.Fragment key={i}>
                              <td className="py-2 px-4 border-b">{trial.grayIndex}</td>
                              <td className="py-2 px-4 border-b">{trial.luminance}</td>
                              <td className="py-2 px-4 border-b">{trial.gamma}</td>
                            </React.Fragment>
                          ) : (
                            <React.Fragment key={i}>
                              <td className="py-2 px-4 border-b">-</td>
                              <td className="py-2 px-4 border-b">-</td>
                              <td className="py-2 px-4 border-b">-</td>
                            </React.Fragment>
                          );
                        });
                      })()
                    : (() => {
                        // trial1, trial2, ...
                        const trialIdx = parseInt(selectedTrial.replace('trial', '')) - 1;
                        const trial = item.trials && item.trials[trialIdx];
                        return trial ? [
                          <td key="grayIndex" className="py-2 px-4 border-b">{trial.grayIndex}</td>,
                          <td key="luminance" className="py-2 px-4 border-b">{trial.luminance}</td>,
                          <td key="gamma" className="py-2 px-4 border-b">{trial.gamma}</td>
                        ] : [
                          <td key="grayIndex" className="py-2 px-4 border-b">-</td>,
                          <td key="luminance" className="py-2 px-4 border-b">-</td>,
                          <td key="gamma" className="py-2 px-4 border-b">-</td>
                        ];
                      })()
                  }
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
