import React, { useState, useEffect, useRef } from 'react';
import { measureLuminance, downloadGamma, cleanLogFile,getData } from '../apis/serial';

export const Gamma = () => {
  const [log, setLog] = useState('');
  const greyIndexRef = useRef(0);
  const taskRef = useRef(null);
  const [data, setData] = useState('');
/*
data example.. 
{
    "gradation_step:1": {
        "data": {
            "lmax": 19.478607,
            "measurements": [
                {
                    "gradation": 0,
                    "luminance": 4.2431292,
                    "gamma": null
                },
                {
                    "gradation": 4,
                    "luminance": 4.2611066,
                    "gamma": 0.3657759726472132
                },
                {
                    "gradation": 8,
                    "luminance": 4.2658064,
                    "gamma": 0.43869544649112074
                },
                {
                    "gradation": 12,
                    "luminance": 4.2775421,
                    "gamma": 0.4959951567764088
                },
                {
                    "gradation": 16,
                    "luminance": 4.2898925,
                    "gamma": 0.5464907252890461
                },
                {
                    "gradation": 20,
                    "luminance": 4.2976555,
                    "gamma": 0.5936863403829443
                },
                {
                    "gradation": 24,
                    "luminance": 4.3261405,
                    "gamma": 0.6366938033236185
                },
                {
                    "gradation": 28,
                    "luminance": 4.3634966,
                    "gamma": 0.6772309179137389
                },
                {
                    "gradation": 32,
                    "luminance": 4.4049534,
                    "gamma": 0.7162453901521008
                },
                {
                    "gradation": 36,
                    "luminance": 4.4551766,
                    "gamma": 0.7535457282715348
                },
                {
                    "gradation": 40,
                    "luminance": 4.5149316,
                    "gamma": 0.7892136173229477
                },
                {
                    "gradation": 44,
                    "luminance": 4.5733386,
                    "gamma": 0.8247082219563524
                },
                {
                    "gradation": 48,
                    "luminance": 4.6447659,
                    "gamma": 0.8583964877354278
                },
                {
                    "gradation": 52,
                    "luminance": 4.7192964,
                    "gamma": 0.8915970996286426
                },
                {
                    "gradation": 56,
                    "luminance": 4.8055871,
                    "gamma": 0.9232314940684392
                },
                {
                    "gradation": 60,
                    "luminance": 4.8999634,
                    "gamma": 0.9538122500235654
                },
                {
                    "gradation": 64,
                    "luminance": 4.9914063,
                    "gamma": 0.9849669684564436
                },
                {
                    "gradation": 68,
                    "luminance": 5.1071643,
                    "gamma": 1.0127986026207791
                },
                {
                    "gradation": 72,
                    "luminance": 5.2338957,
                    "gamma": 1.0391930923933947
                },
                {
                    "gradation": 76,
                    "luminance": 5.349461,
                    "gamma": 1.0675660739789676
                },
                {
                    "gradation": 80,
                    "luminance": 5.4843356,
                    "gamma": 1.0933233913787879
                },
                {
                    "gradation": 84,
                    "luminance": 5.6286262,
                    "gamma": 1.1179747181673951
                },
                {
                    "gradation": 88,
                    "luminance": 5.797294,
                    "gamma": 1.1391061945433738
                },
                {
                    "gradation": 92,
                    "luminance": 5.930579,
                    "gamma": 1.166477820692593
                },
                {
                    "gradation": 96,
                    "luminance": 6.1251923,
                    "gamma": 1.1842444999869821
                },
                {
                    "gradation": 100,
                    "luminance": 6.3248988,
                    "gamma": 1.2016138571141983
                },
                {
                    "gradation": 104,
                    "luminance": 6.5113603,
                    "gamma": 1.2217658788435417
                },
                {
                    "gradation": 108,
                    "luminance": 6.7109732,
                    "gamma": 1.2402895180696494
                },
                {
                    "gradation": 112,
                    "luminance": 6.9250132,
                    "gamma": 1.2569533683944374
                },
                {
                    "gradation": 116,
                    "luminance": 7.1492451,
                    "gamma": 1.2724945061917838
                },
                {
                    "gradation": 120,
                    "luminance": 7.2025418,
                    "gamma": 1.3198726614348966
                },
                {
                    "gradation": 124,
                    "luminance": 7.5946398,
                    "gamma": 1.3063767252764114
                },
                {
                    "gradation": 128,
                    "luminance": 7.8785561,
                    "gamma": 1.3133029991687273
                },
                {
                    "gradation": 132,
                    "luminance": 8.1377444,
                    "gamma": 1.325519537691628
                },
                {
                    "gradation": 136,
                    "luminance": 8.4064682,
                    "gamma": 1.3367861553909155
                },
                {
                    "gradation": 140,
                    "luminance": 8.6865327,
                    "gamma": 1.3467553013765823
                },
                {
                    "gradation": 144,
                    "luminance": 8.9710994,
                    "gamma": 1.3567385082915364
                },
                {
                    "gradation": 148,
                    "luminance": 9.2640396,
                    "gamma": 1.3660046948878501
                },
                {
                    "gradation": 152,
                    "luminance": 9.5467888,
                    "gamma": 1.3783056387029935
                },
                {
                    "gradation": 156,
                    "luminance": 9.883126,
                    "gamma": 1.3807031345640899
                },
                {
                    "gradation": 160,
                    "luminance": 10.209187,
                    "gamma": 1.3860609744211712
                },
                {
                    "gradation": 164,
                    "luminance": 10.530316,
                    "gamma": 1.3934355868464496
                },
                {
                    "gradation": 168,
                    "luminance": 10.879001,
                    "gamma": 1.395837467513271
                },
                {
                    "gradation": 172,
                    "luminance": 11.215281,
                    "gamma": 1.401937347060455
                },
                {
                    "gradation": 176,
                    "luminance": 11.605868,
                    "gamma": 1.3965332067884186
                },
                {
                    "gradation": 180,
                    "luminance": 11.95843,
                    "gamma": 1.400720472627044
                },
                {
                    "gradation": 184,
                    "luminance": 12.341552,
                    "gamma": 1.3984252135594994
                },
                {
                    "gradation": 188,
                    "luminance": 12.724822,
                    "gamma": 1.396758749949216
                },
                {
                    "gradation": 192,
                    "luminance": 13.103482,
                    "gamma": 1.3970516341868322
                },
                {
                    "gradation": 196,
                    "luminance": 13.51331,
                    "gamma": 1.3894858777887444
                },
                {
                    "gradation": 200,
                    "luminance": 13.885773,
                    "gamma": 1.3931151235056265
                },
                {
                    "gradation": 204,
                    "luminance": 14.318717,
                    "gamma": 1.3791535630681448
                },
                {
                    "gradation": 208,
                    "luminance": 14.725348,
                    "gamma": 1.373153931711119
                },
                {
                    "gradation": 212,
                    "luminance": 15.116391,
                    "gamma": 1.3728659404883088
                },
                {
                    "gradation": 216,
                    "luminance": 15.545745,
                    "gamma": 1.3587350175369732
                },
                {
                    "gradation": 220,
                    "luminance": 15.958035,
                    "gamma": 1.3503097069036896
                },
                {
                    "gradation": 224,
                    "luminance": 16.378867,
                    "gamma": 1.3372028395744981
                },
                {
                    "gradation": 228,
                    "luminance": 16.799109,
                    "gamma": 1.3223167670403853
                },
                {
                    "gradation": 232,
                    "luminance": 17.229264,
                    "gamma": 1.2981320246998111
                },
                {
                    "gradation": 236,
                    "luminance": 17.663486,
                    "gamma": 1.2632702727593113
                },
                {
                    "gradation": 240,
                    "luminance": 18.077785,
                    "gamma": 1.2310666488976323
                },
                {
                    "gradation": 244,
                    "luminance": 18.484819,
                    "gamma": 1.187586028622889
                },
                {
                    "gradation": 248,
                    "luminance": 18.880736,
                    "gamma": 1.119988091747852
                },
                {
                    "gradation": 252,
                    "luminance": 19.218519,
                    "gamma": 1.135873007097897
                },
                {
                    "gradation": 255,
                    "luminance": 19.478607,
                    "gamma": null
                }
            ]
        }
    }
}



*/
  const getFormattedTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}:${milliseconds}`;
  };
  
  const getDataAsync = async () => {
    try {
      const data = await getData();
      console.log('Received data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(async () => {
    const measuredData = await getDataAsync();
    console.log(typeof measuredData);
    // measuredData.then(data => {
    //   console.log('Data:', data);
  
    // });
    debugger;
    // first object 
    setData(measuredData["gradation_step:1"].data.measurements);


    return () => {
      if (taskRef.current) {
        clearInterval(taskRef.current);
        taskRef.current = null;
      }
    };
  }, []);

  const downloadLog = () => {
    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'log.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteLog = () => {
    setLog('');
  };

  let greyIndex = 0;

  const taskProcess = async () => {
    if (greyIndex >= 256) {
      greyIndex = 255;
    }

    const msg = `Grey ${greyIndex}`;
    window.color?.send('grey', greyIndex);
    console.log('감마 측정하기');
    setLog((prev) => `[${getFormattedTime()}] ${msg}\n`);

    await measureLuminance();
    greyIndex += 4;
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const cleanTextFile = async () => {
    await cleanLogFile();
    setLog('텍스트 파일이 비워졌습니다.');
    console.log('텍스트 파일이 비워졌습니다.');
  }

  const dataDetail = async () => {
    setLog('상세 데이터 확인');
    console.log('상세 데이터 확인');
  };

  const getRawData = async () => {
    //await cleanLogFile();
    setLog('raw 데이터가져오기');
    console.log('raw 데이터가져오기');
  }


  const measureGamma = async () => {
    window.newWindow?.open('colorratiosubwindow');
    greyIndex = 0;
    await cleanLogFile();
    await sleep(3000);

    if (!taskRef.current) {
      taskRef.current = setInterval(async () => {
        await taskProcess();
        if (greyIndex > 256) {
          clearInterval(taskRef.current);
          taskRef.current = null;
          greyIndex = 0;

          setLog((prev) => `Gray 255\n`);
          setTimeout(() => {
            window.newWindow?.close();
          }, 1000);
          setLog((prev) => prev + `감마 측정 완료\n`);
        }
      }, 800);
    }
  };




  

  const downloadGammaXlsx = async () => {
    try {
      const arrayBuffer = await downloadGamma();  // ArrayBuffer 받음
      console.log('Received ArrayBuffer:', arrayBuffer.byteLength, 'bytes');
      
      const blob = new Blob([arrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      console.log('Created Blob:', blob.size, 'bytes');
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gamma_measurement.xlsx';
      document.body.appendChild(a);  // DOM에 추가
      a.click();
      document.body.removeChild(a);  // DOM에서 제거
      URL.revokeObjectURL(url);
      
      console.log('파일 다운로드 완료');
    } catch (error) {
      console.error('다운로드 실패:', error);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col mt-0 scroll-mt-10 items-center h-screen space-y-4">
       <div>
        {/* Add measure icon */}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mx-2 my-1"
          onClick={measureGamma}
        >
          감마 측정하기
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mx-2 my-1"
          onClick={downloadGammaXlsx}
        >
          감마 측정 결과 다운로드
        </button>
        {/* <button
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mx-2 my-1"
          onClick={deleteLog}
        >
          로그 지우기
        </button> */}
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mx-2 my-1"
          onClick={dataDetail}
        >
          상세 데이터 확인
        </button>
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mx-2 my-1"
          onClick={cleanTextFile}
        >
          상세 데이터 다운로드
        </button>
      </div>
      <div className=" bg-black rounded shadow w-3/5 h-60 overflow-hidden">
        <p className="text-sm font-bold text-red mb-2 w-full bg-white sticky top-0">
          측정 현황
        </p>
        <div className="overflow-y-auto h-full">
          <pre className="whitespace-pre-wrap font-mono text-white">{log}</pre>
        </div>
      </div>

     
      {/* 표 영역 Column (순번, Gray Index, Luminance, 감마  */}
      {data && <div className="mt-4 w-3/5">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">순번</th>
              <th className="py-2 px-4 border-b">계조</th>
              <th className="py-2 px-4 border-b">휘도</th>
              <th className="py-2 px-4 border-b">감마</th>
            </tr>
          </thead>
          <tbody>
            {/* 데이터 행은 여기에 추가, map by axios data */}
            {/* data 에서 map */}
            {data.map((item, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b">{item.id}</td>
                <td className="py-2 px-4 border-b">{item.grayIndex}</td>
                <td className="py-2 px-4 border-b">{item.luminance}</td>
                <td className="py-2 px-4 border-b">{item.gamma}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  );
};
