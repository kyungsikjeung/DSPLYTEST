import React, { useEffect, useState, useCallback } from 'react';


import pointThree from '../assets/images/0.03s.apng';
import pointEight from '../assets/images/0.08s.apng';
import oneSecond from '../assets/images/1s.apng';
import off from '../assets/images/off.png';


const images = [
  pointThree,
  // pointEight,
  // oneSecond,
  off
];

export const LifeCycleSubWindow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // // 키보드 이벤트 핸들러
  // const handleKeyDown = useCallback((event) => {
  //   if (event.key === "ArrowRight") {
  //     setCurrentIndex((prev) => (prev + 1) % images.length);
  //   } else if (event.key === "ArrowLeft") {
  //     setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  //   }
  // }, []);

  // useEffect(() => {
  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => window.removeEventListener("keydown", handleKeyDown);
  // }, [handleKeyDown]);

  useEffect(() => {
    
     window.index.onReceiveIndex((index) => {
      console.log('event idex:', index);
      setCurrentIndex(index);
    });
  },[])
  

  // 이미지 클릭 핸들러
  const handleClick = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
      }}
    >
      <img
        id="apngImage"
        src={images[currentIndex]}
        alt="APNG Animation"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          cursor: 'pointer',
        }}
        onClick={handleClick}
      />
    </div>
  );
};