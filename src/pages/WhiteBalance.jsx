import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { measureLuminance } from '../apis/serial';

// ---------- Utils ----------
const makeEmptyRows = (n) =>
  Array.from({ length: n }, () => ({ Y: null, x: null, y: null, u: null, v: null }));

// McCamy (대략 2850K~6500K 구간에서 적합)
const calcCCT = (x, y) => {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
  const n = (x - 0.3320) / (0.1858 - y);
  const cct = 449 * (n ** 3) + 3525 * (n ** 2) + 6823.3 * n + 5520.33;
  return Math.max(0, Math.round(cct));
};

// 아주 거친 Duv 근사(참고용)
const calcDuv = (x, y) => {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
  const duv = ((y - 0.24) - (x - 0.31) * 2.87) * 1000;
  return Number.isFinite(duv) ? duv.toFixed(4) : '0.0000';
};

const avg = (arr) => {
  const nums = arr.filter(Number.isFinite);
  if (nums.length === 0) return 0;
  return (nums.reduce((s, v) => s + v, 0) / nums.length).toFixed(6);
};

// ---------- Component ----------
export const WhiteBalance = () => {
  const [status, setStatus] = useState('대기 중');
  const [measureDisabled, setMeasureDisabled] = useState(false);
  const [checkedColorIndex, setCheckedColorIndex] = useState(null); // CA-410 패턴 인덱스(10~)
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(5);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [error, setError] = useState(null);
  const [measureData, setMeasureData] = useState(makeEmptyRows(5));

  const navigate = useNavigate();

  // 최신 상태를 위한 refs (stale closure 방지)
  const roundRef = useRef(currentRound);
  const autoRef = useRef(isAutoMode);
  const totalRef = useRef(totalRounds);
  const colorIdxRef = useRef(checkedColorIndex);
  const timeoutRef = useRef(null);

  useEffect(() => { roundRef.current = currentRound; }, [currentRound]);
  useEffect(() => { autoRef.current = isAutoMode; }, [isAutoMode]);
  useEffect(() => { totalRef.current = totalRounds; }, [totalRounds]);
  useEffect(() => { colorIdxRef.current = checkedColorIndex; }, [checkedColorIndex]);

  // totalRounds가 바뀌면 완전 초기화
  useEffect(() => {
    setMeasureData(makeEmptyRows(totalRounds));
    setCurrentRound(0);
    setIsAutoMode(false);
    setStatus('데이터 초기화됨');
    setError(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [totalRounds]);

  // ---------- Serial listener: 등록은 딱 한 번 ----------
  useEffect(() => {
    const handleSerialData = (_event, data) => {
      try {
        const line = String(data ?? '').trim();
        if (!line.includes(',')) return;

        const fields = line.split(',');
        // 안전하게 길이 확인 (최소 10개 필요)
        if (fields.length < 10) return;

        const Y = parseFloat(fields[5]);
        const x = parseFloat(fields[6]);
        const y = parseFloat(fields[7]);
        const u = parseFloat(fields[8]);
        const v = parseFloat(fields[9]);

        if (![Y, x, y, u, v].every(Number.isFinite)) return;

        const idx = roundRef.current;
        const total = totalRef.current;

        if (idx >= total) return; // 초과 방지

        // 깊은 불변 업데이트 : 배열 복사 + 행 객체 새로 생성
        setMeasureData((prev) => {
          const next = prev.map((row) => ({ ...row }));
          next[idx] = { Y, x, y, u, v };
          return next;
        });

        // Auto 모드면 다음 회차 예약
        if (autoRef.current) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            if (autoRef.current) proceedToNextStep();
          }, 1000);
        }
      } catch (e) {
        console.error('Serial parse/update error:', e);
      }
    };

    // preload에서 window.ipcRenderer로 노출했다고 가정
    window.ipcRenderer?.on('serial-data', handleSerialData);
    return () => {
      window.ipcRenderer?.removeListener('serial-data', handleSerialData);
    };
  }, []); // 의존성 없음: 한 번만

  // ---------- Step machine ----------
  const proceedToNextStep = () => {
    if (!autoRef.current) return;

    const idx = roundRef.current;
    const total = totalRef.current;
    const colorCode = colorIdxRef.current;

    if (idx + 1 < total) {
      const next = idx + 1;
      setCurrentRound(next);
      setStatus(`${next + 1}회차 측정 중`);
      // 같은 색으로 계속 측정 (요구사항대로)
      window.colorControl?.changeColor(colorCode);
      // 장비 트리거
      setTimeout(async () => {
        try { await measureLuminance(); }
        catch { handleMeasurementError(); }
      }, 500);
    } else {
      // 종료
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsAutoMode(false);
      setStatus('자동 측정 완료');
      setMeasureDisabled(false);
    }
  };

  const handleMeasurementError = () => {
    const idx = roundRef.current;
    setMeasureData((prev) => {
      const next = prev.map((row) => ({ ...row }));
      next[idx] = { Y: 'ERR', x: 'ERR', y: 'ERR', u: 'ERR', v: 'ERR' };
      return next;
    });
    setError(`${idx + 1}회차: CA-410 연결 에러`);
    setStatus(`측정 에러 - CA-410 연결을 확인해 주세요`);
  };

  // ---------- Controls ----------
  const handleStart = () => {
    if (checkedColorIndex == null) return alert('색상을 선택해주세요.');
    setStatus('테스트 진행 중');
    window.newWindow?.open('patternsubwindow');
    setTimeout(() => {
      window.colorControl?.changeColor(checkedColorIndex);
    }, 300);
  };

  const handleAutoStart = () => {
    if (totalRef.current < 1) return alert('반복 회수는 1 이상이어야 합니다.');
    if (checkedColorIndex == null) return alert('측정할 색상을 선택해주세요.');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setIsAutoMode(true);
    setMeasureDisabled(true);
    setCurrentRound(0);
    setError(null);
    setStatus('자동 측정 준비 중');

    window.newWindow?.open('patternsubwindow');

    setTimeout(() => {
      setStatus('1회차 측정 중');
      window.colorControl?.changeColor(checkedColorIndex);
      setTimeout(async () => {
        try { await measureLuminance(); }
        catch { handleMeasurementError(); }
      }, 500);
    }, 300);
  };

  const handleManualMeasure = async (round) => {
    if (checkedColorIndex == null) return alert('측정할 색상을 선택해주세요.');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setCurrentRound(round);
    setStatus(`${round + 1}회차 수동 측정 중`);
    setMeasureDisabled(true);

    window.colorControl?.changeColor(checkedColorIndex);

    setTimeout(async () => {
      try {
        await measureLuminance();
        setStatus('수동 측정 완료');
        setError(null);
      } catch {
        handleMeasurementError();
      }
      setMeasureDisabled(false);
    }, 500);
  };

  const handleEnd = () => {
    setStatus('테스트 종료됨');
    setIsAutoMode(false);
    setCurrentRound(0);
    setMeasureDisabled(false);
    setCheckedColorIndex(null);
    setError(null);
    window.newWindow?.close();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleReset = () => {
    setMeasureData(makeEmptyRows(totalRef.current));
    setCurrentRound(0);
    setIsAutoMode(false);
    setStatus('데이터 초기화됨');
    setError(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  // ---------- Averages ----------
  const valid = measureData.filter((d) =>
    [d.Y, d.x, d.y].every((v) => v !== null && v !== 'ERR' && Number.isFinite(v))
  );
  const avgY  = avg(valid.map((d) => d.Y));
  const avgX  = avg(valid.map((d) => d.x));
  const avgYc = avg(valid.map((d) => d.y));
  const avgU  = avg(measureData.map((d) => (Number.isFinite(d.u) ? d.u : NaN)));
  const avgV  = avg(measureData.map((d) => (Number.isFinite(d.v) ? d.v : NaN)));

  const avgCCT = calcCCT(parseFloat(avgX), parseFloat(avgYc));
  const avgDuv = calcDuv(parseFloat(avgX), parseFloat(avgYc));

  // ---------- UI ----------
  const colors = ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF'];
  const colorNames = ['White', 'Black', 'Red', 'Green', 'Blue'];

  const handleColorCheck = (index) => {
    // 패턴 인덱스 매핑(앱 규칙에 맞게 10+index 사용)
    const mapped = index + 10;
    setCheckedColorIndex(mapped);
    window.colorControl?.changeColor(mapped);
  };

  return (
    <div className="bg-gray-50 text-gray-800 p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-blue-50 p-10 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-red-500">White Balance 검사</h1>

        {/* 목적 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">목적</h2>
          <p className="text-gray-700 leading-relaxed">
            디스플레이의 Y(휘도), 색도(x,y,u′,v′)를 회차별로 측정하고, CCT/Duv 및 평균값을 산출합니다.
          </p>
        </section>

        {/* 색상 선택 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">디스플레이 표시 색상</h2>
          <div className="grid grid-cols-5 gap-4">
            {colors.map((color, idx) => (
              <div
                key={idx}
                className={`p-4 border-2 rounded-lg ${
                  checkedColorIndex === idx + 10 ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
                } hover:border-blue-600 cursor-pointer transition-all`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorCheck(idx)}
              >
                <div className="text-center mt-2">
                  <span className={`font-semibold ${color === '#000000' ? 'text-white' : 'text-black'}`}>
                    {colorNames[idx]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 설정 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">측정 설정</h2>
          <div className="flex items-center gap-4">
            <label className="text-gray-700">반복 회수:</label>
            <input
              type="number"
              min="1"
              max="20"
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
            <table className="table-auto border-collapse border border-gray-400 mx-auto w-full">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 px-3 py-2">회차</th>
                  <th className="border border-gray-400 px-3 py-2">Y (cd/m²)</th>
                  <th className="border border-gray-400 px-3 py-2">x</th>
                  <th className="border border-gray-400 px-3 py-2">y</th>
                  <th className="border border-gray-400 px-3 py-2">u′</th>
                  <th className="border border-gray-400 px-3 py-2">v′</th>
                  <th className="border border-gray-400 px-3 py-2">CCT (K)</th>
                  <th className="border border-gray-400 px-3 py-2">Duv</th>
                  <th className="border border-gray-400 px-3 py-2">수동측정</th>
                </tr>
              </thead>
              <tbody>
                {measureData.map((d, i) => {
                  const cct = calcCCT(d.x, d.y);
                  const duv = calcDuv(d.x, d.y);
                  return (
                    <tr key={i} className={currentRound === i ? 'bg-yellow-100' : ''}>
                      <td className="border border-gray-400 px-3 py-2 text-center font-semibold">{i + 1}</td>
                      <td className="border border-gray-400 px-3 py-2 text-center">
                        {d.Y === null ? '-' : typeof d.Y === 'number' ? d.Y.toFixed(4) : 'ERR'}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-center">
                        {d.x === null ? '-' : typeof d.x === 'number' ? d.x.toFixed(6) : 'ERR'}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-center">
                        {d.y === null ? '-' : typeof d.y === 'number' ? d.y.toFixed(6) : 'ERR'}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-center">
                        {d.u === null ? '-' : typeof d.u === 'number' ? d.u.toFixed(6) : 'ERR'}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-center">
                        {d.v === null ? '-' : typeof d.v === 'number' ? d.v.toFixed(6) : 'ERR'}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-center font-bold">
                        {cct > 0 ? `${cct}K` : '-'}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-center">
                        {typeof duv === 'string' && duv !== '0.0000' ? duv : '-'}
                      </td>
                      <td className="border border-gray-400 px-2 py-2 text-center">
                        <button
                          onClick={() => handleManualMeasure(i)}
                          disabled={measureDisabled}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded disabled:bg-gray-400"
                        >
                          측정
                        </button>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div><p className="text-gray-600">평균 휘도</p><p className="text-lg font-bold">{avgY} cd/m²</p></div>
              <div><p className="text-gray-600">평균 x</p><p className="text-lg font-bold">{avgX}</p></div>
              <div><p className="text-gray-600">평균 y</p><p className="text-lg font-bold">{avgYc}</p></div>
              <div><p className="text-gray-600">평균 색온도</p><p className="text-xl font-bold text-red-600">{avgCCT}K</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-4">
              <div><p className="text-gray-600">평균 u′</p><p className="text-lg font-bold">{avgU}</p></div>
              <div><p className="text-gray-600">평균 v′</p><p className="text-lg font-bold">{avgV}</p></div>
              <div><p className="text-gray-600">평균 Duv</p><p className="text-lg font-bold">{avgDuv}</p></div>
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
            <button onClick={handleStart} disabled={isAutoMode}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow disabled:bg-gray-400">
              Start 테스트
            </button>
            <button onClick={handleAutoStart} disabled={isAutoMode || measureDisabled}
              className="px-6 py-2 rounded-lg shadow text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400">
              자동 측정 시작
            </button>
            <button onClick={handleReset} disabled={isAutoMode}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow disabled:bg-gray-400">
              데이터 초기화
            </button>
            <button onClick={handleEnd}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow">
              End 테스트
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
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
