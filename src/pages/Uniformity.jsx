import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { measureLuminance} from '../apis/serial';

// Uniformity 계산 함수 (1D 배열)
const calculateUniformity = (arr) => {
  if (!arr || arr.length === 0) return { min: 0, max: 0, uni: 0 };
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const uni = max > 0 ? ((min / max) * 100).toFixed(4) : 0;
  return { min, max, uni };
};

export const Uniformity = () => {
  const [status, setStatus] = useState('대기 중');
  const [checkedColorIndex, setCheckedColorIndex] = useState(null);
  const [measureDisabled, setMeasureDisabled] = useState(false);
  const [measureData, setMeasureData] = useState([0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000]); // 1차원 배열 (길이 9)

  const navigate = useNavigate();

  // === 시리얼 이벤트 구독 ===

  useEffect(() => {
    // TODO: 실제 환경에서는 serialParser.on('data', handleSerialData) 연결
    // TODO: 실제 데이터 수신 시, Index, Value 추출 후 setUniformityData(index, value) 호출
    setUniformityData(0, 0.000000);
  }, []);

  // Uniformity 계산
  const { min, max, uni } = calculateUniformity(measureData);
  
  const setUniformityData = (index, data) =>{
    const newData = [...measureData];
    newData[index] = data;
    setMeasureData(newData);
  }
  // === 기존 핸들러들 ===
  const handleStart = () => {
    setStatus('테스트 진행 중');
    if (checkedColorIndex !== null) {
      window.newWindow.open('patternsubwindow');
      setTimeout(() => {
        window.colorControl.changeColor(checkedColorIndex);
      }, 500);
    } else {
      alert('색상을 선택해주세요.');
    }
  };

  const handleEnd = () => {
    setStatus('테스트 종료됨');
    window.newWindow.close();
    setCheckedColorIndex(null);
    setMeasureDisabled(false);
    setMeasureData([]); // 종료 시 측정값 초기화
  };

  const handleColorCheck = (index) => {
    setCheckedColorIndex(index + 10);
    console.log(`색상 ${index + 10}번 선택됨`);
    window.colorControl.changeColor(index + 10);
  };

  const test = () => {
    console.log('test');
  }

  const pointShowEnd = ()=>{
    setMeasureDisabled(false);
    if (window.colorControl?.showUniformityPoint) {
      window.colorControl.showUniformityPoint(pointIndex);
      window.colorControl?.sendUniformityMode(false, pointIndex);
      //setTimeout(() => {measureLuminance();}, 10);
      // TODO:// Test
      setTimeout(() => {test();}, 10);
    }
  }

  const handlePointClick = (pointIndex) => {
    setStatus(`포인트 ${pointIndex} 선택됨`);
    setMeasureDisabled(true);
    window.colorControl?.sendUniformityMode(true, pointIndex);
    setTimeout(() => {pointShowEnd();}, 2000);
    
  };

  const handleMeasure = () => {
    setStatus('측정 시작');
    console.log('측정하기 실행');
    // TODO: 시리얼 요청 전송
    // random data generation 0.000000 ~ 0.000020
    const simulatedData = Array.from({ length: 9 }, () =>
      parseFloat((Math.random() * 0.00002).toFixed(6))
    );
    setMeasureData(simulatedData);
    setStatus('측정 완료');
    
  };

  const seePoint = () => {
    if (window.newWindow?.open) {
      window.newWindow.open('colorratiosubwindow');
    }
    setMeasureDisabled(true);
    
    setTimeout(() => setMeasureDisabled(false), 2000);
  };

  // 색상 리스트
  const colors = ['#FFFFFF', '#000000'];

  return (
    <div className="bg-gray-50 text-gray-800 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-blue-50 p-10 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-red-500">불량화소 검사</h1>

        {/* 목적 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">목적</h2>
          <p className="text-gray-700 leading-relaxed">
            이 테스트는 Uniformity(균일도)란 디스플레이의 밝기(휘도) 또는 색이 화면 전체에서
            얼마나 균일하게 분포되어 있는지를 평가하는 것입니다.
          </p>
        </section>

        {/* 측정 방법 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">측정 방법 (9포인트)</h2>
          <p className="text-gray-700 leading-relaxed">
            9개의 특정 포인트에서 휘도/색상을 측정하고, Min/Max/Uniformity로 균일도를 산출합니다.
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
                  checkedColorIndex === index + 10
                    ? 'border-blue-500'
                    : 'border-gray-300'
                } hover:border-blue-600 cursor-pointer`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorCheck(index)}
              />
            ))}
          </div>
        </section>

        {/* 3×3 포인트 선택 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">측정 포인트 선택</h2>
          <div className="grid grid-cols-3 gap-4 w-64 mx-auto">
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                onClick={() => handlePointClick(i + 1)}
                className={`flex items-center justify-center w-20 h-20 rounded-lg border-2 cursor-pointer
                  ${status.includes(`${i + 1}`) ? 'border-red-500 bg-yellow-100' : 'border-gray-400 bg-white'}`}
              >
                <span className="text-xl font-bold">{i + 1}</span>
              </div>
            ))}
          </div>
        </section>

        {/* === 측정 결과 테이블 === */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">측정 결과 테이블</h2>
          {measureData.length === 9 ? (
            <>
              <table className="table-auto border-collapse border border-gray-400 mx-auto">
                <tbody>
                  {[0, 1, 2].map((row) => (
                    <tr key={row}>
                      {[0, 1, 2].map((col) => {
                        const idx = row * 3 + col;
                        return (
                          <td
                            key={col}
                            className="border border-gray-400 px-4 py-2 text-center"
                          >
                            {measureData[idx].toFixed(6)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-center mt-4">
                <p>Min: {min.toFixed(6)}</p>
                <p>Max: {max.toFixed(6)}</p>
                <p className="font-bold text-red-600">Uniformity: {uni}%</p>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center">데이터 수신 대기 중...</p>
          )}
        </section>

        {/* 조작 버튼 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">조작(Control)</h2>
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={handleStart}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow"
            >
              Start 테스트
            </button>

            <button
              onClick={seePoint}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow"
            >
              측정 포인트 모두 보기
            </button>

            <button
              onClick={handleMeasure}
              disabled={measureDisabled}
              className="px-6 py-2 rounded-lg shadow text-white 
                         bg-purple-500 hover:bg-purple-600
                         disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
            >
              측정하기
            </button>

            <button
              onClick={handleEnd}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
            >
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
