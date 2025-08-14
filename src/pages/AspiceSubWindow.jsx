import React, { useEffect, useState } from 'react';

/* ───────────────── Mosaic 8×6 패턴 컴포넌트 ───────────────── */
const MosaicPattern = () => {
  const rows = 6;
  const cols = 8;
  const cells = Array.from({ length: rows * cols });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: '100vw',
        height: '100vh',
        margin: 0,
      }}
    >
      {cells.map((_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const isBlack = (row + col) % 2 === 0; // 체커보드
        return (
          <div
            key={i}
            style={{ backgroundColor: isBlack ? '#000' : '#fff' }}
          />
        );
      })}
    </div>
  );
};

/* ────────────────────────── 메인 컴포넌트 ────────────────────────── */
export const AspiceSubWindow = () => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);

  /* 메인창 → 서브창: 색상 인덱스 전달 */
  useEffect(() => {
    if (!window.colorControl?.onColorUpdate) return;

    const handler = (colorIndex) => {
      console.log('서브창: 색상 인덱스 업데이트', colorIndex);
      setSelectedColorIndex(colorIndex);
    };

    window.colorControl.onColorUpdate(handler);

    // 필요하면 이벤트 해제
    return () => window.colorControl.onColorUpdate(null);
  }, []);

  /* 0 = White, 1 = Black */
  const colors = ['#FFFFFF', '#000000'];

  /* ────────── JSX ────────── */
  return (
    <>
      {/* 인덱스 0, 1 ⇒ 단색 배경 */}
      {selectedColorIndex !== null && selectedColorIndex < 2 && (
        <div
          style={{
            backgroundColor: colors[selectedColorIndex],
            width: '100vw',
            height: '100vh',
            margin: 0,
          }}
        />
      )}

      {/* 인덱스 2 ⇒ 8×6 모자이크 */}
      {selectedColorIndex === 2 && <MosaicPattern />}
    </>
  );
};
