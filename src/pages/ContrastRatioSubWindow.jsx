import React, { useEffect, useState } from 'react';

export const ContrastRatioSubWindow = () => {
  const [direction, setDirection] = useState('상');

  useEffect(() => {
    window.contrastControl?.onReceiveDirection((dir) => {
      setDirection(dir);
    });
  }, []);

  const steps = Array.from({ length: 26 }, (_, i) => i * 4); // 0 ~ 100

  // 색상 배치 순서를 결정
  const getOrderedSteps = () => {
    switch (direction) {
      case '상': // 위가 100%, 아래가 0%
        return [...steps].reverse();
      case '하': // 위가 0%, 아래가 100%
        return [...steps];
      case '좌': // 왼쪽이 100%, 오른쪽이 0%
        return [...steps].reverse();
      case '우': // 왼쪽이 0%, 오른쪽이 100%
        return [...steps];
      default:
        return [...steps];
    }
  };

  // 레이아웃 방향 설정
  const getFlexDirection = () => {
    switch (direction) {
      case '상':
      case '하':
        return 'column';
      case '좌':
      case '우':
        return 'row';
      default:
        return 'column';
    }
  };

  // 스타일 설정
  const getStepStyle = (step) => {
    const gray = Math.round(step * 2.55);
    return {
      backgroundColor: `rgb(${gray}, ${gray}, ${gray})`,
      color: gray < 128 ? '#fff' : '#000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '1.1rem',
      fontWeight: 600,
      flex: 1,
    };
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: getFlexDirection(),
      }}
    >
      {getOrderedSteps().map((step, i) => (
        <div key={i} style={getStepStyle(step)}>
          {step}%
        </div>
      ))}
    </div>
  );
};
