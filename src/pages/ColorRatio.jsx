import React, { useState,useEffect } from 'react';

export const ColorRatio = () => {
  const [status, setStatus] = useState('대기 중');
  const [greyValue, setGreyValue] = useState('');
  const [type, setType] = useState('grey');

  const handleStart = () => {
    newWindow.open('colorratiosubwindow');
    setStatus('테스트 진행 중');
    
  };

  const handleEnd = () => {
    //ipcRenderer.send('close-test-window');
    window.newWindow.close(); 
    setStatus('테스트 종료됨');
  };

  const onClickSaveGrayValue = () => {
    console.log('grayValue:', greyValue);
    window.color.send(type,greyValue);
  }

  const changeColor  = (index) => {
    switch(index) {
      case 1:
        setType('red');
        break;
      case 2:
        setType('green');
        break;
      case 3:
        setType('blue');
        break;
      case 4:
        setType('grey');
        break;
      default:
        setType('grey');
        console.error('Invalid color index:', index);
      return;}
  }

   useEffect(() => {
      
  
      
      return () => {
      
      };
    }, []);

  



  return (
    <div className="bg-gray-50 text-gray-800 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-blue-50 p-10 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-red-500">색상비 테스트</h1>
        <br />
        {/* 설명 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">목적</h2>
          <p className="text-gray-700 leading-relaxed">
            색상 간 밝기 차이에 따른 시각적 구분 가능 여부를 판단함으로써, 디스플레이의 색상 표현 정확도를 검증
            계조 변화에 따른 디스플레이의 감마 특성을 확인하여, 입력된 밝기 값이 어떻게 시각적으로 출력되는지를 평가
             색상에 따른 화면 전체의 밝기 및 색상 균일도를 평가
          </p>
        </section>

        {/* 목적 대기주*/}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">테스트절차</h2>
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 my-3 mx-1 rounded"onClick={()=>{changeColor(1)}}>R</button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 mx-2 rounded" onClick={()=>{changeColor(2)}}>G</button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 mx-2 rounded" onClick={()=>{changeColor(3)}}>B</button>
          <button className="bg-black hover:bg-grey-700 text-white font-semibold py-2 px-6 mx-2 rounded" onClick={()=>{changeColor(4)}}>Grey</button>
          
          <div>
            <p className="text-gray-700 leading-relaxed">감마값 확인을 위한 GreyValue 선택(입력 후 Enter키를 눌러주세요)</p>
            <input
              className="px-4 py-2 border rounded-md mt-2 mr-4"
              type="text"
              id="grayValue"
              name="grayValue"
              value={greyValue}
              onChange={(e) => setGreyValue(e.target.value)}
              placeholder="grayvalue입력(0~255)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onClickSaveGrayValue();
                }
              }}
            />
            <button
              className="bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded"
              onClick={onClickSaveGrayValue}
            >
             저장하기
            </button>
            
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

        {/* 상태 메시지 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">상태(Status)</h2>
          <p className="text-xl font-bold text-red-600">{status}</p>
        </section>
      </div>
    </div>
  );
};
