import React, { useEffect, useState } from 'react';

export const PatternSubWindow = () => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);

  useEffect(() => {
    // 메인창에서 보내주는 색상 변경 메시지 수신
    window.colorControl.onColorUpdate((colorIndex) => {
      console.log('서브창: 색상 인덱스 업데이트', colorIndex);
      setSelectedColorIndex(colorIndex);
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
    selectedColorIndex !== null && selectedColorIndex >= 0 && selectedColorIndex < colors.length
      ? colors[selectedColorIndex]
      : '#FFFFFF';

  return (
    <div
      style={{
        backgroundColor,
        width: '100vw',
        height: '100vh',
        margin: 0,
      }}
    />
  );
};
