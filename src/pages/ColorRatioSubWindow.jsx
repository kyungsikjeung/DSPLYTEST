import React, { useState, useEffect } from 'react';

export const ColorRatioSubWindow = () => {
  const [type, setType] = useState('grey');
  const [value, setValue] = useState(125);
  const [color, setColor] = useState('#111111');

  useEffect(() => {
    window.color?.onReceive((data) => {
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
      }}
    />
  );
};