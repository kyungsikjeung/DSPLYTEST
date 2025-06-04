import React, { useState, useEffect } from 'react';

export function Alarm1() {
  useEffect(() => {
    // ipcRenderer.on('test-reply', (event, message) => {
    //   console.log(message);
    // });

    return () => {
      // ipcRenderer.on('test-reply');
    };
  }, []);

  const handleClick = () => {
    // ipcRenderer.send('test');
  };

  return <div className="flex justify-center items-center h-screen">선택한 메뉴 항목 테스트 할 내용</div>;
}
