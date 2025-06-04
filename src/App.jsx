import React, { useEffect, useState } from 'react';

export default function App() {
  const ipcRenderer = window.ipcRenderer;
  const [getPortList, setPortList] = useState([]);

  useEffect(() => {
    const handleButtonClickReply = (event, message) => {
      console.log(message); // 메인 프로세스에서 받은 메시지 출력
      setPortList(message); // message를 사용하여 포트 리스트를 설정
    };
    // 메인 프로세스에서 보낸 메시지를 수신
    window.ipcRenderer.on('get-port-reply', (message) => {
      console.log(message); // 메인 프로세스에서 받은 메시지 출력
      setPortList(list);
    });
    ipcRenderer.send('get-port-list', 'client ask port list');
  }, []);

  const handleClick = () => {
    // 버튼 클릭 시 메인 프로세스로 메시지 전송
    ipcRenderer.send('get-port-list', 'client ask port list');
  };

  return (
    <div className="min-h-screen max-h-full  flex items-center justify-center">
      <div className="text-center">
        <div className="font-bold text-black mb-4">Testing</div>
        <button className="px-4 py-2 bg-blue-500 text-white font-bold rounded" onClick={handleClick}>
          Click Me
        </button>
      </div>
    </div>
  );
}
