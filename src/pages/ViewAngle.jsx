import React, { useState } from 'react';
import viewangle from '../assets/images/viewangle.png'; // 이미지 임포트

export const ViewAngle = () => {
  const [status, setStatus] = useState('대기 중');
  const [numCircles, setNumCircles] = useState(1); // 원의 개수 선택
  const [circles, setCircles] = useState([]); // 원들의 상태 (정상/불량)

  const handleStart = () => {
    setStatus('테스트 진행 중');
    console.log('선택된 원의 갯수' + numCircles);

    // 형식은 아래와 같다. 내 창의 subwindow
    newWindow.open('viewanglesubwindow');
    setTimeout(() => {
      window.circleControl.changeCircleNum(numCircles); // 2. 딜레이 후 색상 보내기
    }, 500);
    // generateCircles();
  };

  const handleEnd = () => {
    setStatus('테스트 종료됨');
    window.newWindow.close(); 
  };

  const handleCircleCountChange = (e) => {
    console.log(Number(e.target.value));
    setNumCircles(Number(e.target.value));
    window.circleControl.changeCircleNum(Number(e.target.value)); // 서브창에 원 개수 변경 메시지 전송
  };

  return (
    <div className="bg-gray-50 text-gray-800 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-blue-50 p-10 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-red-500">시야각 테스트</h1>

        {/* 목적 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">목적</h2>
          <p className="text-gray-700 leading-relaxed">
            이 테스트는 화면의 시야각에 따른 원의 왜곡 여부를 확인하는 도구입니다. 선택된 원의 개수에 따라 각기 다른
            시야각에서 원이 어떻게 왜곡되어 보이는지를 점검합니다. 올바른 원은 정상적으로 보이고, 잘못된 원은 시야각에
            따라 왜곡되어 보입니다.
          </p>
        </section>

        {/* 원 개수 선택 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">원 개수 선택</h2>
          <select onChange={handleCircleCountChange} value={numCircles} className="px-6 bg-white border rounded-lg">
            <option value="1">1개</option>
            <option value="10">10개</option>
            <option value="50">50개</option>
          </select>
        </section>
        {/* 이미지 표시 */}
        <section className="mb-8 mx-auto">
          <h2 className="text-xl font-semibold mb-2">시야각 테스트 예시</h2>
          <img
            src={viewangle}
            alt="View Angle Test Example"
            className="w-full h-[550px] object-cover rounded-lg shadow-md"
          />
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
