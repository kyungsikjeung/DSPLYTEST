import React, { useState, useEffect } from 'react';

export const ColorRatioSubWindow = () => {
  const [type, setType] = useState('grey');
  const [value, setValue] = useState(0);
  const [color, setColor] = useState(`rgb(0, 0, 0)`);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.color?.onReceive((data) => {
      setLoading(false);
      console.log('서브창: 색상 인덱스 업데이트', JSON.stringify(data));
      switch(data.type){
        case 'grey':
          setColor(`rgb(${data.value}, ${data.value}, ${data.value})`);
          break;
        case 'red':
          setColor(`rgb(${data.value}, 0, 0)`);
          break;
        case 'green':
          setColor(`rgb(0, ${data.value}, 0)`);
          break;
        case 'blue':
          setColor(`rgb(0, 0, ${data.value})`);
          break;
        default:
          console.error('Unknown color type:', data.type);
      }
    });
  }, []);

  return (
    <div
      style={{
        backgroundColor: color,
        width: '100vw',
        height: '100vh',
        margin: 0,
        position: 'relative',
      }}
    >
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          fontSize: '2rem',
          fontWeight: 'bold',
          textShadow: '0 0 8px #000',
        }}>
          로딩중...
        </div>
      )}
    </div>
  );
};