// import { readReg } from '../apis/log.js';
import React, { useState, useEffect } from 'react';

/*
 * @brief 레지스터 세팅 페이지(Serializer, Deserializer, Indigo)
 */
export const LOG = () => {
  const ipcRenderer = window.ipcRenderer;
  let task = null;
  const [log, setLog] = useState('');
  const [cmd, setCmd] = useState('');
  const [hasError, setHasError] = useState(false);
  const [lifeCycleIdx, setLifeCycleIdx] = useState(1);

  const getFormattedTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}:${milliseconds}`;
  };

  const logMessage = ['0.03초 라이프사이클', 'OFF 라이프사이클'];

const onClickStartLifeCycle = () => {
    const nextIdx = (lifeCycleIdx + 1) % 2;
    newWindow.open('lifecyclesubwindow');

    setTimeout(() => {
      window.index.changeIndex(nextIdx);
      const timeStamp = getFormattedTime();
      setLifeCycleIdx(nextIdx);
      setLog((prevLog) => prevLog + `[${timeStamp}] ${logMessage[nextIdx]}\n`);
    }, 200);
  };

  const onClickStopLifeCycle = () => {
    window.newWindow.close();
  };

  const executeCmd = (cmdText) => {
    // const receivedCmd = { cmd: cmdText };
    // // readReg(receivedCmd)
    //   .then((response) => {
    //     const timeStamp = getFormattedTime();
    //     if (response.error) {
    //       setHasError(true);
    //       setLog((prev) => prev + `[${timeStamp}] ${response.error}\n`);
    //     } else {
    //       setHasError(false);
    //       setLog((prev) => prev + `[${timeStamp}] ${response.data}\n`);
    //     }
    //   })
    //   .catch((error) => {
    //     const timeStamp = getFormattedTime();
    //     setHasError(true);
    //     setLog((prev) => prev + `[${timeStamp}] Read failed: ${error}\n`);
    //   });
  };

  const onClickStartVideo = () => {
    executeCmd('WIB 48 0002 43');
  };

  const onClickStopVideo = () => {
    executeCmd('WIB 48 0002 03');
  };

  const onClickCmd = () => {
    executeCmd(cmd);
  };

  useEffect(() => {
    const timeStamp = getFormattedTime();
    setLog((prev) => prev + `[${timeStamp}]HostInt  \n`);

    ipcRenderer.send('subscribe-to-serial', '레지스터세팅');

    const handleSerialData = (event, data) => {
      const timeStamp = getFormattedTime();
      setLog((prevLog) => prevLog + `[${timeStamp}] ${data}\n`);
    };

    ipcRenderer.on('serial-data', handleSerialData);

    return () => {
      clearInterval(task);
      task = null;
      ipcRenderer.removeListener('serial-data', handleSerialData);
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

  const onClickRequestFirmware = () => {
    const timeStamp = getFormattedTime();
    setLog((prev) => prev + `[${timeStamp}] 제어기 펌웨어 요청(0x60001200,0x1111)\n`);
    executeCmd('almw4 0x60001200 0x00001111');
  };

  const onClickCancelFirmwareRequest = () => {
    const timeStamp = getFormattedTime();
    setLog((prev) => prev + `[${timeStamp}] 제어기 펌웨어 요청해제(0x60001200,0x0000FFFF)\n`);
    executeCmd('almw4 0x60001200 0x0000FFFF');
  };

  const onClickFirmwareRequestStatus = () => {
    const timeStamp = getFormattedTime();
    setLog((prev) => prev + `[${timeStamp}] 제어기 펌웨어 요청상태확인(1111-ON요청, FFFF-OFF요청)\n`);
    executeCmd('almr4 0x60001200');
  };

  const onClickADBoardStatus = () => {
    const timeStamp = getFormattedTime();
    setLog((prev) => prev + `[${timeStamp}] A/D펌웨어 요청 처리상태확인(0x60001204)\n`);
    executeCmd('almr4 0x60001204');
  };

  const onClickFirmwareUpdate = () => {
    const timeStamp = getFormattedTime();
    setLog((prev) => prev + `[${timeStamp}] 펌웨어업데이트시작(파일명: firmware.bin)\n`);
    setLog((prev) => prev + `[${timeStamp}] 펌웨어업데이트시작(0~47섹터 Erase/Write)\n`);
    executeCmd('u');
  };

  const onClickCrcFirmwareDone = () => {
    const timeStamp = getFormattedTime();
    executeCmd('c');
    setLog((prev) => prev + `[${timeStamp}] 신규 F/W CRC Info.\n[${timeStamp}] // 신규 F/W Update Flag(Req_FW_Upd)\n`);
  };

  const onClickADBoardFirmwareProcessStatus = () => {
    const timeStamp = getFormattedTime();
    setLog((prev) => prev + `[${timeStamp}] A/D보드 펌웨어 처리상태확인(0x60001210)\n`);
    executeCmd('almr4 0x60001210');
  };

  const onClickSysReset = () => {
    const timeStamp = getFormattedTime();
    setLog((prev) => prev + `[${timeStamp}] SYS_리셋\n`);
    executeCmd('s');
  };

  var greyIndex = 0;

  const taskProcess = () => {
    window.color.send('grey', greyIndex);
    console.log('감마 측정하기');
    greyIndex++;
    console.log(greyIndex);
   
    setTimeout(() => {
       mouse.click();
    }, 100);
  };

  const getSysFaultValue = () => {
    const timeStamp = getFormattedTime();
    setLog((prev) => prev + `[${timeStamp}] rib 48 0130\n`);
    executeCmd('rib 48 0130');
  };

  const measureGamma = () => {
    newWindow.open('colorratiosubwindow');
    mouse.Move({ x: 2465, y: 1457 });
    if (task == null) {
      task = setInterval(() => {
        taskProcess();
        if (greyIndex > 255) {
          clearInterval(task);
          task = null;
          greyIndex = 0;
          setTimeout(() => {window.newWindow.close();},1000);
        }
      }, 800);
    }
  };

  return (
    <div className="flex flex-col mt-0 scroll-mt-10 items-center h-screen space-y-4">
      <div className="mt-10 bg-black rounded shadow w-3/5 h-96 overflow-hidden">
        <p className="text-sm font-bold text-red mb-2 w-full bg-white sticky top-0">터미널 로그</p>
        <div className="overflow-y-auto h-full">
          <pre className={`whitespace-pre-wrap font-mono text-white`}>{log}</pre>
        </div>
      </div>

      <div>
        <button
          className="bg-yellow-400 hover:bg-yellow-500 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={onClickRequestFirmware}
        >
          제어기 펌웨어 요청
        </button>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={onClickCancelFirmwareRequest}
        >
          제어기 펌웨어 요청해제
        </button>
        <button
          className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={onClickFirmwareRequestStatus}
        >
          제어기 펌웨어 요청상태
        </button>
        <button
          className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={onClickADBoardStatus}
        >
          A/D보드 요청 처리 상태
        </button>
        <button
          className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={onClickFirmwareUpdate}
        >
          펌웨어 업데이트
        </button>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={onClickCrcFirmwareDone}
        >
          CRC + 펌웨어 업데이트 완
        </button>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={onClickADBoardFirmwareProcessStatus}
        >
          Req_HW_Reset 상태
        </button>
        <button
          className="bg-rose-600 hover:bg-rose-700 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={onClickSysReset}
        >
          SYS_RESET
        </button>
      </div>

      <div>
        <button
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={onClickStartLifeCycle}
        >
          영상 LifeCycle 영상 송출(다음영상)
        </button>
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={onClickStopLifeCycle}
        >
          영상 LifeCycle 창닫기
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={onClickStartVideo}
        >
          영상 송출 시작
        </button>
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={onClickStopVideo}
        >
          영상 송출 중단
        </button>
        <button className="bg-lime-500 hover:bg-lime-600 text-white py-2 px-4 rounded mx-1 my-1" onClick={downloadLog}>
          로그 다운로드 받기
        </button>
        <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mx-1 my-1" onClick={deleteLog}>
          로그 지우기
        </button>
        <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mx-1 my-1" onClick={measureGamma}>
          감마 측정하기
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mx-1 my-1"
          onClick={getSysFaultValue}
        >
          SYS_FAULT 값 읽기
        </button>
      </div>

      <div>
        <input
          className="px-4 py-2 border rounded-md mt-2 mr-4"
          type="text"
          id="cmd"
          name="cmd"
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          placeholder="Enter command(개발용)"
        />
        <button className="bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded" onClick={onClickCmd}>
          명령어 치기
        </button>
      </div>
    </div>
  );
};
