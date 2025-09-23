import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Uniformity = () => {
  const [status, setStatus] = useState('대기 중');
  const [checkedColorIndex, setCheckedColorIndex] = useState(null);

  // 색상 리스트 (12단계)
  const colors = [
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
    setCheckedColorIndex(index+10);
    console.log(`색상 ${index + 10}번 선택됨`);

    // 색 선택할 때마다 서브창에 색상 보내기
    window.colorControl.changeColor(index+10);
  };

  const seePoint = () => {
    window.newWindow?.open('colorratiosubwindow');
  }
  const nextPoint = () => {
    window.newWindow?.open('colorratiosubwindow');
  }

  return (
    <div className="bg-gray-50 text-gray-800 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-blue-50 p-10 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-red-500">불량화소 검사</h1>

        {/* 목적 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">목적</h2>
          <p className="text-gray-700 leading-relaxed">
            이 테스트는 Uniformity(균일도)란 디스플레이의 밝기(휘도) 또는 색이 화면 전체에서 얼마나 균일하게 분포되어 있는지를 평가하는 것입니다.
            균일도가 높을수록 화면의 밝기와 색상이 고르게 분포되어 있어 시각적으로 더 쾌적한 경험을 제공합니다. 
            반대로 균일도가 낮으면 화면의 특정 부분이 더 밝거나 어둡게 나타나거나, 색상이 일관되지 않게 보여 시청 경험에 부정적인 영향을 미칠 수 있습니다.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">측정 방법 (9포인트)</h2>
          <p className="text-gray-700 leading-relaxed">
            이 테스트는 9개의 특정 포인트에서 디스플레이의 밝기와 색상을 측정하여 균일도를 평가합니다.
            각 포인트에서의 측정값은 평균값과 비교되어, 전체적인 균일도를 판단하는 데 사용됩니다.
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

            <button onClick={seePoint} className="px-6 py-2 bg-blue-500 hover:bg-red-600 text-white rounded-lg shadow">
              측정 포인트 보기
            </button>

             <button onClick={nextPoint} className="px-6 py-2 bg-blue-500 hover:bg-red-600 text-white rounded-lg shadow">
              다음 측정 포인트 
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
