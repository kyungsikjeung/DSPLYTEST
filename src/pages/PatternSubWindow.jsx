import React, { useEffect, useState } from 'react';

export const PatternSubWindow = () => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);

  // uniformity test 여부
  const [isUniformityTest, setIsUniformityTest] = useState(false); // uniformity test mode 시, index에 따른 점 위치 표시
  const [uniformityIndex, setUniformityIndex] = useState(1); // uniformity 1~9

  useEffect(() => {
    // 메인창에서 보내주는 색상 변경 메시지 수신
    window.colorControl.onColorUpdate((colorIndex) => {
      console.log('서브창: 색상 인덱스 업데이트', colorIndex);
      setSelectedColorIndex(colorIndex);
    });

    // uniformity test 여부 메시지 수신 (예시)
    window.colorControl.onUniformityMode((data) => {
      console.log('서브창: uniformity test 모드 변경', data.flag, data.idx);
      setIsUniformityTest(data.flag);
      if (data.idx) setUniformityIndex(data.idx);
    });
  }, []);

  const colors = [
    '#FF0000',
    '#FF7F00',
    '#FFFF00',
    '#00FF00',
    '#0000FF',
    '#4B0082',
    '#8A2BE2',
    '#FFC0CB',
    '#A52A2A',
    '#808080',
    '#FFFFFF',
    '#000000',
  ];

  const backgroundColor =
    selectedColorIndex !== null &&
    selectedColorIndex >= 0 &&
    selectedColorIndex < colors.length
      ? colors[selectedColorIndex]
      : '#FFFFFF';

  // 9포인트 비율 좌표 (0~1)
  const uniformityPoints = {
    1: { x: 1 / 10, y: 1 / 10 },
    2: { x: 5 / 10, y: 1 / 10 },
    3: { x: 9 / 10, y: 1 / 10 },
    4: { x: 1 / 10, y: 5 / 10 },
    5: { x: 5 / 10, y: 5 / 10 },
    6: { x: 9 / 10, y: 5 / 10 },
    7: { x: 1 / 10, y: 9 / 10 },
    8: { x: 5 / 10, y: 9 / 10 },
    9: { x: 9 / 10, y: 9 / 10 },
  };

  return (
    <div
      style={{
        backgroundColor,
        width: '100vw',
        height: '100vh',
        margin: 0,
        position: 'relative',
      }}
    >
  {isUniformityTest && uniformityPoints[uniformityIndex] && (
  <div
    style={{
      position: 'absolute',
      top: `${uniformityPoints[uniformityIndex].y * 100}%`,
      left: `${uniformityPoints[uniformityIndex].x * 100}%`,
      transform: 'translate(-50%, -50%)', // 꼭 필요
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      border: '2px solid black',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      color: '#de2020ff',
    }}
  >
    {uniformityIndex}
  </div>
)}

    </div>
  );
};
