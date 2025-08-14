import React, { useState, useEffect, useRef } from 'react';
import { measureLuminance, downloadGamma, cleanLogFile } from '../apis/serial';

export const Gamma = () => {
  const [log, setLog] = useState('');
  const greyIndexRef = useRef(0);
  const taskRef = useRef(null);

  const getFormattedTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}:${milliseconds}`;
  };

  useEffect(() => {
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

  const taskProcess = async () => {
    if (greyIndexRef.current >= 256) {
      greyIndexRef.current = 255;
    }

    const msg = `Grey ${greyIndexRef.current}`;
    window.color?.send('grey', greyIndexRef.current);
    console.log('감마 측정하기');
    setLog((prev) => `[${getFormattedTime()}] ${msg}\n`);

    await measureLuminance();
    greyIndexRef.current += 4;
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const measureGamma = async () => {
    window.newWindow?.open('colorratiosubwindow');
    await cleanLogFile();
    await sleep(3000);

    if (!taskRef.current) {
      taskRef.current = setInterval(async () => {
        await taskProcess();
        if (greyIndexRef.current > 256) {
          clearInterval(taskRef.current);
          taskRef.current = null;
          greyIndexRef.current = 0;

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
      <div className="mt-10 bg-black rounded shadow w-3/5 h-96 overflow-hidden">
        <p className="text-sm font-bold text-red mb-2 w-full bg-white sticky top-0">
          현황 로그
        </p>
        <div className="overflow-y-auto h-full">
          <pre className="whitespace-pre-wrap font-mono text-white">{log}</pre>
        </div>
      </div>

      <div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={measureGamma}
        >
          감마 측정하기
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={downloadGammaXlsx}
        >
          감마 측정 결과 다운로드
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={deleteLog}
        >
          로그 지우기
        </button>
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={downloadLog}
        >
          로그 다운로드
        </button>
      </div>
    </div>
  );
};
