
import React, { useState, useEffect } from 'react';

/*
 * @brief 레지스터 세팅 페이지(Serializer, Deserializer, Indigo)
 */
export const Gamma = () => {
  //const ipcRenderer = window.ipcRenderer;
  let task = null;
  const [log, setLog] = useState('');
 
 
  const getFormattedTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}:${milliseconds}`;
  };

  useEffect(() => {
    const timeStamp = getFormattedTime();
    //setLog((prev) => prev + `[${timeStamp}]HostInt  \n`);

    //ipcRenderer.send('subscribe-to-gamma', '감마세팅');

    const handleSerialData = (event, data) => {
      const timeStamp = getFormattedTime();
      setLog((prevLog) => prevLog + `[${timeStamp}] ${data}\n`);
    };

    //ipcRenderer.on('serial-data', handleSerialData);

    return () => {
      clearInterval(task);
      task = null;
      //ipcRenderer.removeListener('serial-data', handleSerialData);
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

  

  var greyIndex = 0;

  const taskProcess = () => {
    
    if(greyIndex == 256){
      greyIndex = 255;
    }
    const msg = `Grey ${greyIndex}`
    //console.log('test'+greyIndex);
    setLog(msg);
    window.color.send('grey', greyIndex);
    console.log('감마 측정하기');
    greyIndex = greyIndex + 4;
    
   
    setTimeout(() => {
       //mouse.click();
    }, 100);
  };


  // promise sleep time interval
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const measureGamma = () => {
    newWindow.open('colorratiosubwindow');
    sleep(3000).then(() => {
      if (task == null) {
      task = setInterval(() => {
        taskProcess();
        if (greyIndex > 256) {
          clearInterval(task);
          task = null;
          greyIndex = 0;
          setLog((prev) => 'Gray 255');
          setTimeout(() => {window.newWindow.close();},1000);
          setLog((prev) => `감마 측정 완료\n`);
        }
      }, 400);
    }
    });
  };


  const downloadGammaXlsx  = ()=> {



  } 



  return (
    <div className="flex flex-col mt-0 scroll-mt-10 items-center h-screen space-y-4">
      <div className="mt-10 bg-black rounded shadow w-3/5 h-96 overflow-hidden">
        <p className="text-sm font-bold text-red mb-2 w-full bg-white sticky top-0">현황 로그</p>
        <div className="overflow-y-auto h-full">
          <pre className={`whitespace-pre-wrap font-mono text-white`}>{log}</pre>
        </div>
      </div>

      <div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mx-1 my-1" onClick={measureGamma}>
          감마 측정하기
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mx-1 my-1" onClick={downloadGammaXlsx}>
          감마 측정 결과 다운로드
        </button>
        <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mx-1 my-1" onClick={deleteLog}>
          로그 지우기
        </button>
        
   
      </div>

     
    </div>
  );
};
