import React, { useState } from 'react';
import upImg from '../assets/images/up.png';
import rightImg from '../assets/images/right.png';
import downImg from '../assets/images/down.png';
import leftImg from '../assets/images/left.png';

export const ContrastRatio = () => {
  const [status, setStatus] = useState('대기 중');
  const [checkedDirection, setCheckedDirection] = useState(null); // 선택된 방향
  const [testStep, setTestStep] = useState(0); // 테스트 단계

  const handleStart = () => {
    if (!checkedDirection) {
      alert('방향을 선택해주세요.');
      return;
    }

    newWindow.open('contrastratiosubwindow');
    setStatus('테스트 진행 중');
    setTestStep(1);

    setTimeout(() => {
      window.contrastControl.changeDirection(checkedDirection);
    }, 500);
  };

  const handleEnd = () => {
    setStatus('테스트 종료됨');
    setTestStep(0); // 테스트 종료
  };

  const handleDirectionCheck = (direction) => {
    setCheckedDirection(direction);
    window.contrastControl.changeDirection(direction);
  };

  const handleNextStep = () => {
    if (testStep < 14) {
      setTestStep(testStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (testStep > 0) {
      setTestStep(testStep - 1);
    }
  };

  // 각 방향을 배열로 정의
  const directions = [
    { label: '상', value: '상', img: upImg },
    { label: '하', value: '하', img: downImg },
    { label: '좌', value: '좌', img: leftImg },
    { label: '우', value: '우', img: rightImg },
  ];

  return (
    <div className="bg-gray-50 text-gray-800 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-blue-50 p-10 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-red-500">명암비 테스트</h1>

        {/* 목적 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">목적</h2>
          <p className="text-gray-700 leading-relaxed">
            이 테스트는 4% 단위로 증가하는 그레이 패턴을 다양한 방향(상/하/좌/우)으로 배치하여, 0% ~ 8% 및 92% ~ 100%
            구간에서 각 밝기 단계가 육안으로 명확히 구분되는지 확인하는 도구입니다. 이를 통해 모니터가 얼마나 정확하게
            밝기를 표현하고 사용자가 미세한 밝기 차이를 인지할 수 있는지 간단히 평가할 수 있습니다.
          </p>
        </section>

        {/* 방향 선택 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">패턴 방향 선택</h2>
          <div className="grid grid-cols-4 gap-4">
            {directions.map((dir) => (
              <div
                key={dir.value}
                onClick={() => handleDirectionCheck(dir.value)}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer 
                  transition-transform duration-150 hover:scale-105
                  ${checkedDirection === dir.value ? 'border-blue-500' : 'border-gray-300'} 
                  hover:border-blue-600
                `}
              >
                {/* 이미지 크기를 적당히 줄이고, 가운데 정렬 + object-contain으로 깨짐 최소화 */}
                <img src={dir.img} alt={dir.value} className="mx-auto mb-2 w-20 h-20 object-contain" />
                <p className="text-center">{dir.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 버튼 조작 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">조작(Control)</h2>
          <div className="flex gap-4">
            <button
              onClick={handleStart}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow"
            >
              Start 테스트
            </button>
            <button onClick={handleEnd} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow">
              End 테스트
            </button>
          </div>
        </section>

        {/* 상태 메시지 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">상태(Status)</h2>
          <p className="text-gray-700 font-bold text-red-600">{status}</p>
        </section>
      </div>
    </div>
  );
};
