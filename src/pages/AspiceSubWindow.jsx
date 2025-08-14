import React, { useEffect, useState } from 'react';

/* ���������������������������������� Mosaic 8��6 ���� ������Ʈ ���������������������������������� */
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
        const isBlack = (row + col) % 2 === 0; // üĿ����
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

/* ���������������������������������������������������� ���� ������Ʈ ���������������������������������������������������� */
export const AspiceSubWindow = () => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);

  /* ����â �� ����â: ���� �ε��� ���� */
  useEffect(() => {
    if (!window.colorControl?.onColorUpdate) return;

    const handler = (colorIndex) => {
      console.log('����â: ���� �ε��� ������Ʈ', colorIndex);
      setSelectedColorIndex(colorIndex);
    };

    window.colorControl.onColorUpdate(handler);

    // �ʿ��ϸ� �̺�Ʈ ����
    return () => window.colorControl.onColorUpdate(null);
  }, []);

  /* 0 = White, 1 = Black */
  const colors = ['#FFFFFF', '#000000'];

  /* �������������������� JSX �������������������� */
  return (
    <>
      {/* �ε��� 0, 1 �� �ܻ� ��� */}
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

      {/* �ε��� 2 �� 8��6 ������ũ */}
      {selectedColorIndex === 2 && <MosaicPattern />}
    </>
  );
};
