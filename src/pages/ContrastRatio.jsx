import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { measureLuminance } from '../apis/serial';

// ----- Utilities -----
const makeEmptyRows = (n) =>
  Array.from({ length: n }, () => ({ white: null, black: null }));

const toRatio = (whiteLum, blackLum) => {
  if (!Number.isFinite(whiteLum) || !Number.isFinite(blackLum) || blackLum === 0) return 0;
  return (whiteLum / blackLum).toFixed(2);
};

const avg = (arr) => {
  const nums = arr.filter((v) => Number.isFinite(v));
  if (nums.length === 0) return 0;
  return (nums.reduce((s, v) => s + v, 0) / nums.length).toFixed(6);
};

// ----- Component -----
export const ContrastRatio = () => {
  const [status, setStatus] = useState('대기 중');
  const [measureDisabled, setMeasureDisabled] = useState(false);
  const [currentColor, setCurrentColor] = useState(null);           // 'white' | 'black' | null
  const [currentRound, setCurrentRound] = useState(0);              // 0-based
  const [totalRounds, setTotalRounds] = useState(3);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [error, setError] = useState(null);
  const [measureData, setMeasureData] = useState(makeEmptyRows(3));

  const navigate = useNavigate();

  // ---- Refs to avoid stale closures ----
  const roundRef = useRef(currentRound);
  const colorRef = useRef(currentColor);
  const autoModeRef = useRef(isAutoMode);
  const totalRoundsRef = useRef(totalRounds);
  const autoTimeoutRef = useRef(null);

  useEffect(() => { roundRef.current = currentRound; }, [currentRound]);
  useEffect(() => { colorRef.current = currentColor; }, [currentColor]);
  useEffect(() => { autoModeRef.current = isAutoMode; }, [isAutoMode]);
  useEffect(() => { totalRoundsRef.current = totalRounds; }, [totalRounds]);

  // totalRounds 변경 시 행 리셋
  useEffect(() => {
    setMeasureData(makeEmptyRows(totalRounds));
    setCurrentRound(0);
    setCurrentColor(null);
    setIsAutoMode(false);
    setStatus('데이터 초기화됨');
    setError(null);
    if (autoTimeoutRef.current) clearTimeout(autoTimeoutRef.current);
  }, [totalRounds]);

  // ---- Serial handler: register ONCE, read latest state via refs ----
  useEffect(() => {
    const handleSerialData = (_event, data) => {
      try {
        const trimmed = String(data ?? '').trim();
        if (!trimmed.includes(',')) return;

        const fields = trimmed.split(',');
        const lv = parseFloat(fields[5]);
        if (!Number.isFinite(lv)) return;

        const idx = roundRef.current;                // latest
        const key = colorRef.current;                // 'white' | 'black'
        const total = totalRoundsRef.current;

        if (!key || idx >= total) return;

        // Deep-immutable update: clone array AND the target row object
        setMeasureData((prev) => {
          const next = prev.map((row) => ({ ...row }));   // shallow clone each row object
          const base = next[idx] ?? { white: null, black: null };
          next[idx] = { ...base, [key]: lv };
          return next;
        });

        // Auto step scheduling
        if (autoModeRef.current) {
          if (autoTimeoutRef.current) clearTimeout(autoTimeoutRef.current);
          autoTimeoutRef.current = setTimeout(() => {
            if (autoModeRef.current) proceedToNextStep();
          }, 4000);
        }
      } catch (e) {
        console.error('Serial parse/update error:', e);
      }
    };

    // NOTE: ipcRenderer는 preload에서 노출되었다고 가정(예: window.ipcRenderer)
    window.ipcRenderer?.on('serial-data', handleSerialData);
    return () => {
      window.ipcRenderer?.removeListener('serial-data', handleSerialData);
    };
  }, []); // register once

  // ---- Step machine ----
  const proceedToNextStep = () => {
    if (!autoModeRef.current) return;

    const idx = roundRef.current;
    const key = colorRef.current;

    if (key === 'white') {
      setCurrentColor('black');
      setStatus(`${idx + 1}회차 - Black 측정 중`);
      window.colorControl?.changeColor(11);
      setTimeout(async () => {
        try { await measureLuminance(); }
        catch { handleMeasurementError('black'); }
      }, 1500);
    } else if (key === 'black') {
      const total = totalRoundsRef.current;
      if (idx + 1 < total) {
        const nextRound = idx + 1;
        setCurrentRound(nextRound);
        setCurrentColor('white');
        setStatus(`${nextRound + 1}회차 - White 측정 중`);
        window.colorControl?.changeColor(10);
        setTimeout(async () => {
          try { await measureLuminance(); }
          catch { handleMeasurementError('white'); }
        }, 1500);
      } else {
        // Done
        if (autoTimeoutRef.current) clearTimeout(autoTimeoutRef.current);
        setIsAutoMode(false);
        setCurrentColor(null);
        setStatus('자동 측정 완료');
        setMeasureDisabled(false);
      }
    }
  };

  const handleMeasurementError = (color) => {
    const idx = roundRef.current;
    setMeasureData((prev) => {
      const next = prev.map((row) => ({ ...row }));
      const base = next[idx] ?? { white: null, black: null };
      next[idx] = { ...base, [color]: 'ERR' };
      return next;
    });
    setError(`${idx + 1}회차 ${color}: CA-410 연결 에러`);
    setStatus(`측정 에러 - CA-410 연결을 확인해 주세요`);
  };

  // ---- Controls ----
  const handleAutoStart = () => {
    if (totalRoundsRef.current < 1) {
      alert('반복 회수는 1 이상이어야 합니다.');
      return;
    }
    if (autoTimeoutRef.current) clearTimeout(autoTimeoutRef.current);

    setStatus('자동 측정 준비 중');
    setIsAutoMode(true);
    setMeasureDisabled(true);
    setCurrentRound(0);
    setCurrentColor('white');
    setError(null);

    window.newWindow?.open('patternsubwindow');

    setTimeout(() => {
      setStatus('1회차 - White 측정 중');
      window.colorControl?.changeColor(10);
      setTimeout(async () => {
        try { await measureLuminance(); }
        catch { handleMeasurementError('white'); }
      }, 1500);
    }, 1000);
  };

  const handleManualMeasure = async (color, round) => {
    if (autoTimeoutRef.current) clearTimeout(autoTimeoutRef.current);

    setCurrentColor(color);
    setCurrentRound(round);
    setStatus(`${round + 1}회차 - ${color} 수동 측정 중`);
    setMeasureDisabled(true);

    window.colorControl?.changeColor(color === 'white' ? 10 : 11);

    setTimeout(async () => {
      try {
        await measureLuminance();
        setStatus('수동 측정 완료');
        setError(null);
      } catch {
        handleMeasurementError(color);
      }
      setMeasureDisabled(false);
    }, 1500);
  };

  const handleEnd = () => {
    setStatus('테스트 종료됨');
    setIsAutoMode(false);
    setCurrentColor(null);
    setCurrentRound(0);
    setMeasureDisabled(false);
    setError(null);
    window.newWindow?.close();
    if (autoTimeoutRef.current) clearTimeout(autoTimeoutRef.current);
  };

  const handleReset = () => {
    setMeasureData(makeEmptyRows(totalRoundsRef.current));
    setCurrentRound(0);
    setCurrentColor(null);
    setIsAutoMode(false);
    setStatus('데이터 초기화됨');
    setError(null);
    if (autoTimeoutRef.current) clearTimeout(autoTimeoutRef.current);
  };

  // ---- Averages / Ratio ----
  const whiteAvg = avg(measureData.map((d) => (typeof d.white === 'number' ? d.white : NaN)));
  const blackAvg = avg(measureData.map((d) => (typeof d.black === 'number' ? d.black : NaN)));
  const avgCR = toRatio(parseFloat(whiteAvg), parseFloat(blackAvg));

  return (
    <div className="bg-gray-50 text-gray-800 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-blue-50 p-10 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-red-500">Contrast Ratio 검사</h1>

        {/* 목적 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">목적</h2>
          <p className="text-gray-700 leading-relaxed">
            디스플레이의 White/Black 휘도를 측정하여 명암비(White / Black)를 산출합니다.
          </p>
        </section>

        {/* 설정 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">측정 설정</h2>
          <div className="flex items-center gap-4">
            <label className="text-gray-700">반복 회수:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={totalRounds}
              onChange={(e) => setTotalRounds(parseInt(e.target.value) || 1)}
              disabled={isAutoMode}
              className="px-3 py-2 border border-gray-300 rounded-lg w-20"
            />
            <span className="text-gray-600">회</span>
          </div>
        </section>

        {/* 결과 테이블 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">측정 결과</h2>
          <div className="overflow-x-auto">
            <table className="table-auto border-collapse border border-gray-400 mx-auto w-full max-w-2xl">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 px-4 py-2">회차</th>
                  <th className="border border-gray-400 px-4 py-2">White (cd/m²)</th>
                  <th className="border border-gray-400 px-4 py-2">Black (cd/m²)</th>
                  <th className="border border-gray-400 px-4 py-2">Contrast Ratio</th>
                  <th className="border border-gray-400 px-4 py-2">수동 측정</th>
                </tr>
              </thead>
              <tbody>
                {measureData.map((data, index) => {
                  const cr = toRatio(
                    typeof data.white === 'number' ? data.white : NaN,
                    typeof data.black === 'number' ? data.black : NaN
                  );
                  return (
                    <tr key={index} className={currentRound === index ? 'bg-yellow-100' : ''}>
                      <td className="border border-gray-400 px-4 py-2 text-center font-semibold">
                        {index + 1}
                      </td>
                      <td className="border border-gray-400 px-4 py-2 text-center">
                        {data.white === null
                          ? '-'
                          : typeof data.white === 'number'
                            ? data.white.toFixed(6)
                            : 'ERR'}
                      </td>
                      <td className="border border-gray-400 px-4 py-2 text-center">
                        {data.black === null
                          ? '-'
                          : typeof data.black === 'number'
                            ? data.black.toFixed(6)
                            : 'ERR'}
                      </td>
                      <td className="border border-gray-400 px-4 py-2 text-center font-bold">
                        {Number.isFinite(parseFloat(cr)) && cr !== 'NaN'
                          ? `${cr}:1`
                          : '-'}
                      </td>
                      <td className="border border-gray-400 px-2 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handleManualMeasure('white', index)}
                            disabled={measureDisabled}
                            className="px-2 py-1 bg-white border border-gray-400 text-xs rounded hover:bg-gray-100 disabled:bg-gray-200"
                          >
                            W
                          </button>
                          <button
                            onClick={() => handleManualMeasure('black', index)}
                            disabled={measureDisabled}
                            className="px-2 py-1 bg-black text-white text-xs rounded hover:bg-gray-800 disabled:bg-gray-400"
                          >
                            B
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 평균 */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-semibold mb-3 text-green-700">평균 결과</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-600">White 평균</p>
                <p className="text-xl font-bold">{whiteAvg} cd/m²</p>
              </div>
              <div>
                <p className="text-gray-600">Black 평균</p>
                <p className="text-xl font-bold">{blackAvg} cd/m²</p>
              </div>
              <div>
                <p className="text-gray-600">평균 명암비</p>
                <p className="text-2xl font-bold text-red-600">{avgCR}:1</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 font-bold">{error}</p>
            </div>
          )}
        </section>

        {/* 컨트롤 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">조작(Control)</h2>
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={handleAutoStart}
              disabled={isAutoMode || measureDisabled}
              className="px-6 py-2 rounded-lg shadow text-white 
                         bg-green-500 hover:bg-green-600
                         disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
            >
              자동 측정 시작
            </button>

            <button
              onClick={() => window.newWindow?.open('patternsubwindow')}
              disabled={isAutoMode}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow disabled:bg-gray-400"
            >
              패턴 창 열기
            </button>

            <button
              onClick={handleReset}
              disabled={isAutoMode}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow disabled:bg-gray-400"
            >
              데이터 초기화
            </button>

            <button
              onClick={handleEnd}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
            >
              테스트 종료
            </button>
          </div>
        </section>

        {/* 상태 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">상태(Status)</h2>
          <p className="text-gray-700 font-bold text-red-600">{status}</p>
          {isAutoMode && (
            <div className="mt-2 text-blue-600">
              <p>자동 측정 진행 중... ({currentRound + 1}/{totalRounds}회차)</p>
              <p>현재 측정: {currentColor === 'white' ? 'White' : currentColor === 'black' ? 'Black' : '-'}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
