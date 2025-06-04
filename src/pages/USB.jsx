import React, { useState } from 'react';
import { firmwareDownload } from '../apis/usb.js';
import { readReg } from '../apis/log.js'; // 레지스터 읽기, 쓰기
export const USB = () => {
  // 파일 이름과 확장자를 관리하는 상태
  const [fileName, setFileName] = useState('');
  const [fileExtension, setFileExtension] = useState('');
  const [fullFileName, setFullFileName] = useState('');

  // 파일 설정 함수
  const handleSetFile = (e) => {
    e.preventDefault(); // 버튼 클릭 시 페이지 리로드 방지
    if (fileName && fileExtension) {
      setFullFileName(`${fileName}.${fileExtension}`);
      // 파일 이름 설정
      var receivedCmd = {"cmd":`f ${fileName}.${fileExtension}\r\n`};
      console.log(receivedCmd);
      // 파일 이름 설정
      readReg(receivedCmd)
        .then((response) => {
          if (response.error) {
            // 에러 발생 시
            //setHasError(true);
            //setLog(`${response.error}`);
          } else {
            // 정상 처리 시
            //setLog(response.data);
            //setHasError(false);
          }
        })
        .catch((error) => {
          //setLog(`Read failed: ${error}`);
          //setHasError(true);
        });

      console.log(fullFileName);
    } else {
      alert('파일 이름과 확장자를 모두 입력해주세요.');
    }
  };

  // 데이터 보내기 함수
  const handleSendData = (e) => {
    e.preventDefault(); // 버튼 클릭 시 페이지 리로드 방지
    if (fullFileName) {
      console.log('전송할 파일:', fullFileName);


    var modifiedDataObj = { "fullFileName" : fullFileName };
    firmwareDownload(modifiedDataObj)
      .then((response) => {
        if(response.error){
          console.log(response.error); // 에러 로그
        }else{
          console.log(response.data); // 성공 로그
        }
      })
      .catch((error) => { 
        console.log(error); // 에러 로그
      });
      
      alert(`파일이 전송되었습니다: ${fullFileName}`);
    } else {
      alert('먼저 파일을 설정해주세요.');
    }
  };

  return (
    <div className="flex flex-col items-center mt-20 scroll-mt-10 justify-start h-screen space-y-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">  펌웨어 설정</h1>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">파일 이름:</label>
          <input
            type="text"
            className="border rounded py-2 px-3 text-gray-700 w-full"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="파일 이름 입력"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">파일 확장자:</label>
          <input
            type="text"
            className="border rounded py-2 px-3 text-gray-700 w-full"
            value={fileExtension}
            onChange={(e) => setFileExtension(e.target.value)}
            placeholder="파일 확장자 입력 (예: txt, jpg)"
          />
        </div>

        

        <div className="mb-6">
          <button
            className="bg-blue-500 text-white py-2 px-4 w-full rounded hover:bg-blue-600 transition-colors"
            onClick={handleSetFile}
          >
            파일 설정
          </button>
        </div>

        {fullFileName && (
          <div className="mb-6 bg-green-100 text-green-700 p-4 rounded-lg">
            <h2 className="text-lg font-semibold">설정된 파일: {fullFileName}</h2>
          </div>
        )}

        <div className="mb-6">
          <button
            className="bg-green-500 text-white py-2 px-4 w-full rounded hover:bg-green-600 transition-colors"
            onClick={handleSendData}
          >
            펌웨어 업데이트
          </button>   
        </div>

        <div>
          <button
            className="bg-red-500 text-white py-2 px-4 w-full rounded hover:bg-red-600 transition-colors"
            onClick={handleSendData}
          >
            펌웨어 업데이트 + CRC 에러
          </button>   
        </div>


      </div>
    </div>
  );
};
