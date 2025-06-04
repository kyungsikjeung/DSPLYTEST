import React, { useState } from 'react';

export const Readability = () => {
  const [status, setStatus] = useState('대기 중');

  const handleStart = () => {
    setStatus('테스트 진행 중');
    newWindow.open('readabilitysubwindow');
  };

  const handleEnd = () => {
    setStatus('테스트 종료됨');
     window.newWindow.close(); 
  };

  return (
    <div className="bg-gray-50 text-gray-800 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-blue-50 p-10 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-red-500">가독성(리더빌리티) 테스트</h1>

        {/* 목적 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">목적</h2>
          <p className="text-gray-700 leading-relaxed">
            이 테스트는 다양한 배경색과 밝기 환경에서 한글 및 영문 텍스트의 가독성을 평가하기 위한 도구입니다.
            전체화면에 다양한 명도 대비의 텍스트를 출력하여 사용자가 글자를 명확히 인식할 수 있는지를 시험합니다.
          </p>
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

        {/* 상태 메시지 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">상태(Status)</h2>
          <p className="text-gray-700 font-bold text-red-600">{status}</p>
        </section>
      </div>
    </div>
  );
};
