import React from 'react';

const backgrounds = [
  { bg: '#FFFFFF', fg: '#000000' },
  { bg: '#000000', fg: '#FFFFFF' },
  { bg: '#F0F0F0', fg: '#333333' },
  { bg: '#333333', fg: '#F0F0F0' },
  { bg: '#FFD700', fg: '#000000' },
  { bg: '#00008B', fg: '#FFFFFF' },
  { bg: '#4B0082', fg: '#FFFFFF' },
  { bg: '#008000', fg: '#FFFFFF' },
];

const texts = [
  '동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세. 남산 위에 저 소나무, 철갑을 두른 듯 바람서리 불변함은 우리 기상일세.',
  'The quick brown fox jumps over the lazy dog multiple times across the vast green field. Pack my box with five dozen liquor jugs and discover the rhythm of typefaces.',
];

export const ReadabilitySubWindow = () => {
  return (
    <div className="w-screen h-screen">
      {backgrounds.map((pair, i) => (
        <div
          key={i}
          className="flex items-center justify-center w-full h-[12.5vh]"
          style={{ backgroundColor: pair.bg, color: pair.fg }}
        >
          <div className="text-xl font-bold text-center px-4">
            <p className="mb-2">{texts[0]}</p>
            <p>{texts[1]}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
