import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Aspice = () => {
  const [status, setStatus] = useState('대기 중');
  const [checkedColorIndex, setCheckedColorIndex] = useState(null);

  // 색상 리스트 (12단계)
  const colors = [
    {color : '#FFFFFF', text : "화이트 패턴"},
    {color : '#000000', text : "블랙 패턴"},
    {color : '#0000FF', text : "Mosaic 패턴"}, // 파랑 RGB #0000FF
  ];

  const navigate = useNavigate();

  const handleStart = () => {
    setStatus('테스트 진행 중');
    if (checkedColorIndex !== null) {
      window.newWindow.open('aspicesubwindow'); // 1. 새 창 열기
      setTimeout(() => {
        window.colorControl.changeColor(checkedColorIndex); // 2. 딜레이 후 색상 보내기
      }, 200);
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
        <h1 className="text-2xl font-bold mb-6 text-red-500">Aspice Test</h1>

        {/* 목적 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">목적</h2>
          <p className="text-gray-700 leading-relaxed">
            화이트, 블랙 , 모자이크 8*6 패턴 선택 가능
          </p>
        </section>

        {/* 색상 리스트 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">테스트 패턴</h2>
          <div className="grid grid-cols-4 gap-4">
            {colors.map((list, index) => (
              <div
                key={index}
                className={`p-4 border-2 rounded-lg ${
                  checkedColorIndex === index ? 'border-blue-500' : 'border-gray-300'
                } hover:border-blue-600 cursor-pointer ${list.color === '#000000' ? 'text-white' : 'text-black'} text-center`}
                style={{ backgroundColor: list.color }}
                onClick={() => handleColorCheck(index)}
              >{list.text} </div>
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
