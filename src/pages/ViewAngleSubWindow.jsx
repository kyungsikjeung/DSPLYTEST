import React, { useEffect, useState } from 'react';

export const ViewAngleSubWindow = () => {
  const [circleCount, setCircleCount] = useState(1);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    window.viewAngleControl.onReceiveCount((count) => {
      setCircleCount(count);
    });

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const screenWidth = windowSize.width;
  const screenHeight = windowSize.height;

  // 목표: 전체 화면을 꽉 채우는 columns, rows 계산
  let columns = 1;
  let rows = 1;
  let bestFitSize = 0;

  for (let cols = 1; cols <= circleCount; cols++) {
    const rowsNeeded = Math.ceil(circleCount / cols);
    const sizeW = screenWidth / cols;
    const sizeH = screenHeight / rowsNeeded;
    const circleSize = Math.min(sizeW, sizeH);
    if (circleSize > bestFitSize) {
      bestFitSize = circleSize;
      columns = cols;
      rows = rowsNeeded;
    }
  }

  const marginRatio = 0.05;
  const margin = bestFitSize * marginRatio;
  const circleDiameter = bestFitSize - margin;

  const totalWidth = columns * bestFitSize;
  const totalHeight = rows * bestFitSize;

  const startX = (screenWidth - totalWidth) / 2;
  const startY = (screenHeight - totalHeight) / 2;

  const paddedCount = columns * rows;

  const circles = Array.from({ length: paddedCount }, (_, i) => {
    const row = Math.floor(i / columns);
    const col = i % columns;
    const x = startX + col * bestFitSize + margin / 2;
    const y = startY + row * bestFitSize + margin / 2;

    const isVisible = i < circleCount;

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: `${circleDiameter}px`,
          height: `${circleDiameter}px`,
          backgroundColor: isVisible ? 'white' : 'rgba(255, 255, 255, 1)',
          borderRadius: '50%',
          boxShadow: isVisible ? '0 0 4px rgba(255,255,255,0.5)' : 'none',
        }}
      />
    );
  });

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {circles}
    </div>
  );
};
