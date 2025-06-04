import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Pattern = () => {
  const [status, setStatus] = useState('대기 중');
  const [checkedColorIndex, setCheckedColorIndex] = useState(null);

  // 색상 리스트 (12단계)
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

  const navigate = useNavigate();

  const handleStart = () => {
    setStatus('테스트 진행 중');
    if (checkedColorIndex !== null) {
      window.newWindow.open('patternsubwindow'); // 1. 새 창 열기
      setTimeout(() => {
        window.colorControl.changeColor(checkedColorIndex); // 2. 딜레이 후 색상 보내기
      }, 500);
    } else {
      alert('색상을 선택해주세요.');
    }
  };

  const handleEnd = () => {
    setStatus('테스트 종료됨');
    window.newWindow.close(); // 서브창 닫기
    setCheckedColorIndex(null); // 색상 선택 초기화
  };

  const handleColorCheck = (index) => {
    setCheckedColorIndex(index);
    console.log(`색상 ${index + 1}번 선택됨`);

    // 색 선택할 때마다 서브창에 색상 보내기
    window.colorControl.changeColor(index);
  };

  return (
    <div className="bg-gray-50 text-gray-800 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-blue-50 p-10 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-red-500">불량화소 검사</h1>

        {/* 목적 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">목적</h2>
          <p className="text-gray-700 leading-relaxed">
            이 테스트는 모니터의 RGB 색상 밝기 구분 능력과 불량화소를 확인하는 도구입니다. 전체화면에서 12단계 색상을
            순차적으로 표시하여, 미세한 밝기 차이를 인식하고, 불량화소를 검출합니다.
          </p>
        </section>

        {/* 색상 리스트 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">디스플레이 표시 색상</h2>
          <div className="grid grid-cols-4 gap-4">
            {colors.map((color, index) => (
              <div
                key={index}
                className={`p-4 border-2 rounded-lg ${
                  checkedColorIndex === index ? 'border-blue-500' : 'border-gray-300'
                } hover:border-blue-600 cursor-pointer`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorCheck(index)}
              />
            ))}
          </div>
        </section>

        {/* 조작 버튼 */}
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

        {/* 상태 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">상태(Status)</h2>
          <p className="text-gray-700 font-bold text-red-600">{status}</p>
        </section>
      </div>
    </div>
  );
};
