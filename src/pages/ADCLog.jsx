import { readReg } from '../apis/log.js';
import React, { useState, useEffect } from 'react';

export const ADC = () => {
  const ipcRenderer = window.ipcRenderer;
  const [log, setLog] = useState('');
  const [cmd, setCmd] = useState('');
  const [hasError, setHasError] = useState(false);

  const getFormattedTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}:${String(
      now.getMilliseconds()
    ).padStart(3, '0')}`;
  };

  const onClickCmd = () => {
    const receivedCmd = { cmd };
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
  };

  useEffect(() => {
    ipcRenderer.send('subscribe-to-serial', '레지스터세팅');
    const handleSerialData = (event, data) => {
      const timeStamp = getFormattedTime();
      setLog((prevLog) => `[${timeStamp}] ${data}\n` + prevLog );
      //setLog((prevLog) => prevLog + `[${timeStamp}] ${data}\n`);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'F2') {
            //const receivedCmd = { cmd };
            //alert(JSON.stringify(receivedCmd));
            setInterval(() => {
                // executeCmd("almr4 0x60000F04");
                executeCmd("m");
            },2000)
           //executeCmd("almr4 0x60000F40");
        }else if(e.key == 'F3'){
          setLog("");
        }
    };

    window.addEventListener('keydown', handleKeyDown);


    ipcRenderer.on('serial-data', handleSerialData);
    return () => {
      ipcRenderer.removeListener('serial-data', handleSerialData);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

  const downloadLog = () => {
    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'log.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteLog = () => setLog('');

  const faultItems = [
      { label: '12V_UVP', reg: '0x60000F00', color: 'bg-rose-500', hover: 'hover:bg-rose-600' },
      { label: '12V_OVP', reg: '0x60000F04', color: 'bg-pink-500', hover: 'hover:bg-pink-600' },
      { label: 'DC1_UVP (1.26)', reg: '0x60000F08', color: 'bg-fuchsia-500', hover: 'hover:bg-fuchsia-600' },
      { label: 'DC1_OVP (1.26)', reg: '0x60000F0C', color: 'bg-purple-500', hover: 'hover:bg-purple-600' },
      { label: 'DC2_UVP (1.8)', reg: '0x60000F10', color: 'bg-violet-500', hover: 'hover:bg-violet-600' },
      { label: 'DC2_OVP (1.8)', reg: '0x60000F14', color: 'bg-indigo-500', hover: 'hover:bg-indigo-600' },
      { label: 'DC3_UVP (3.3)', reg: '0x60000F18', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
      { label: 'DC3_OVP (3.3)', reg: '0x60000F1C', color: 'bg-cyan-500', hover: 'hover:bg-cyan-600' },
      { label: 'DC4_UVP (5)', reg: '0x60000F20', color: 'bg-teal-500', hover: 'hover:bg-teal-600' },
      { label: 'DC4_OVP (5)', reg: '0x60000F24', color: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
      { label: 'DC5_UVP (13)', reg: '0x60000F28', color: 'bg-lime-500', hover: 'hover:bg-lime-600' },
      { label: 'DC5_OVP (13)', reg: '0x60000F2C', color: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
      { label: 'LED_Fail', reg: '0x60000F30', color: 'bg-amber-500', hover: 'hover:bg-amber-600' },
      { label: 'LCD_Fail', reg: '0x60000F34', color: 'bg-orange-500', hover: 'hover:bg-orange-600' },
      { label: 'Video_Freeze', reg: '0x60000F38', color: 'bg-red-500', hover: 'hover:bg-red-600' },
      { label: 'NO_Signal', reg: '0x60000F3C', color: 'bg-neutral-500', hover: 'hover:bg-neutral-600' },
      { label: 'WL_CRC', reg: '0x60000F40', color: 'bg-zinc-500', hover: 'hover:bg-zinc-600' },
      { label: 'NM_Img_CRC', reg: '0x60000F44', color: 'bg-gray-500', hover: 'hover:bg-gray-600' },
      { label: 'SM_Img_CRC', reg: '0x60000F48', color: 'bg-slate-500', hover: 'hover:bg-slate-600' },
      { label: 'Flash_ECC', reg: '0x60000F4C', color: 'bg-stone-500', hover: 'hover:bg-stone-600' },
      { label: 'RAM_ECC', reg: '0x60000F50', color: 'bg-green-500', hover: 'hover:bg-green-600' },
      { label: 'FW_Upd_Res', reg: '0x60000F54', color: 'bg-sky-500', hover: 'hover:bg-sky-600' },
  ];


  const onClickFaultCheck = (index) => {
    const item = faultItems[index];
    const timeStamp = getFormattedTime();
    deleteLog();
    setLog((prev) =>  prev + `[${timeStamp}] ${item.label} 체크\n`  );
    setLog((prev) => prev + `[${timeStamp}] 0x00001111 - OK , 0x0000FFFF 에러\n`);

    const receivedCmd = { cmd: `almr4 ${item.reg}` };

    readReg(receivedCmd)
      .then((response) => {
        if (response.error) {
          setHasError(true);
          setLog((prev) => prev + `${response.error}\n`);
        } else {
          setHasError(false);
        }
      })
      .catch((error) => {
        setHasError(true);
        setLog((prev) => prev + `Read failed: ${error}\n`);
      });
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-6 bg-gray-100 min-h-screen">
      <div className="w-full max-w-4xl">
        <div className="bg-black rounded-lg shadow-lg overflow-hidden h-96">
          <p className="text-white bg-gray-800 text-sm font-bold px-4 py-2 sticky top-0">
            터미널 로그
          </p>
          <div className="overflow-y-auto h-full px-4 py-8">
            <pre
              className={`whitespace-pre-wrap font-mono text-md ${
                hasError ? 'text-red-500' : 'text-white'
              }`}
            >
              {log}
            </pre>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-4xl">
        {faultItems.map((item, index) => (
            <button
            key={index}
            className={`${item.color} ${item.hover} text-white font-semibold py-2 px-4 rounded transition duration-200`}
            onClick={() => onClickFaultCheck(index)}
            >
            {item.label}
            </button>
        ))}
      </div>

      <div className="flex space-x-4">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
          onClick={downloadLog}
        >
          로그 다운로드
        </button>
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
          onClick={deleteLog}
        >
          로그 초기화
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <input
          className="border border-gray-300 rounded-md px-4 py-2 w-80"
          type="text"
          placeholder="명령어 입력 (예: almr4 0x60000F00)"
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          onClick={onClickCmd}
        >
          명령 실행
        </button>
      </div>
    </div>
  );
};


