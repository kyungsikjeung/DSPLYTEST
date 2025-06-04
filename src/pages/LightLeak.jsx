import React, { useState } from 'react';
import bit_saem from '../assets/images/bitsam.png';
import meong from '../assets/images/mung.png';
import hanji from '../assets/images/hanji.png';
import bitsaem_muni from '../assets/images/bitsal.png';
import geurein from '../assets/images/grain.png';

export const LightLeak = () => {
  const [selectedGray, setSelectedGray] = useState(null); // 선택된 그레이 색상

  const handleGraySelection = (value) => {
    setSelectedGray(value);
  };

  return (
    <div className="bg-gray-50 text-gray-800 p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-blue-50 p-10 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-red-500">Light Leak 테스트</h1>

        {/* 설명 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">테스트 목적</h2>
          <p className="text-gray-700 leading-relaxed">
            이 테스트는 선택한 그레이 색상에 대해 화면에서 빛샘, 멍, 한지, 빛살무늬, 그레인 패턴이 제대로 나타나지
            않는지 확인하는 테스트입니다. 각 단계별로 5개의 이미지 패턴을 사용하여, 선택된 그레이 색상에서 이 패턴들이
            표시되지 않는지 검출합니다.
          </p>
          <p className="text-gray-700 mt-4 font-semibold">
            주의: 테스트 중 화면에 빛샘, 멍, 한지, 빛살무늬, 그레인 패턴이 정상적으로 표시되거나 왜곡되는 경우가 없어야
            합니다.
          </p>
        </section>

        {/* 카드 형식으로 이미지 표시 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">패턴 예시</h2>
          <div className="grid grid-cols-5 gap-4">
            <div className="card">
              <img src={bit_saem} alt="빛샘" className="w-90 h-48 object-cover object-cover  rounded-lg" />
              <p className="text-center mt-2">빛샘</p>
            </div>
            <div className="card">
              <img src={meong} alt="멍" className="w-90 h-48 object-cover rounded-lg" />
              <p className="text-center mt-2">멍</p>
            </div>
            <div className="card">
              <img src={hanji} alt="한지" className="w-90 h-48 object-cover rounded-lg" />
              <p className="text-center mt-2">한지</p>
            </div>
            <div className="card">
              <img src={bitsaem_muni} alt="빛살무늬" className="w-90 h-48 object-cover rounded-lg" />
              <p className="text-center mt-2">빛살무늬</p>
            </div>
            <div className="card">
              <img src={geurein} alt="그레인" className="w-90 h-48 object-cover rounded-lg" />
              <p className="text-center mt-2">그레인</p>
            </div>
          </div>
        </section>

        {/* 그레이 색상 선택 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">그레이 색상 선택</h2>
          <div className="flex justify-center gap-4 ">
            <div className="cursor-pointer" onClick={() => handleGraySelection('0%')}>
              <div className="w-16 h-16 bg-gray-800 rounded-lg border-black border-2"></div>
            </div>
            <div className="cursor-pointer" onClick={() => handleGraySelection('20%')}>
              <div className="w-16 h-16 bg-gray-600 rounded-lg border-red-200"></div>
            </div>
            <div className="cursor-pointer" onClick={() => handleGraySelection('40%')}>
              <div className="w-16 h-16 bg-gray-400 rounded-lg border-black border-2"></div>
            </div>
            <div className="cursor-pointer" onClick={() => handleGraySelection('60%')}>
              <div className="w-16 h-16 bg-gray-200 rounded-lg border-black border-2"></div>
            </div>
            <div className="cursor-pointer" onClick={() => handleGraySelection('80%')}>
              <div className="w-16 h-16 bg-gray-100 rounded-lg border-black border-2"></div>
            </div>
          </div>
          <p className="mt-4">선택된 그레이 색상: {selectedGray}</p>
        </section>

        {/* 버튼 조작 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">조작(Control)</h2>
          <div className="flex gap-4">
            <button
              onClick={() => {
                newWindow.open('lightleaksubwindow');
              }}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow"
            >
              Start 테스트
            </button>
            <button
              onClick={() => {
                newWindow.close();
              }}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
            >
              End 테스트
            </button>
          </div>
        </section>

        {/* 상태 메시지 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">상태(Status)</h2>
          <p className="text-gray-700 font-bold text-red-600">대기 중</p>
        </section>
      </div>
    </div>
  );
};
