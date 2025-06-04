const { contextBridge, ipcRenderer } = require('electron');

// 간단한 데스크탑 정보
contextBridge.exposeInMainWorld('myAPI', {
  desktop: true,
});

// 기본 IPC Renderer 노출
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(event, ...args)),
  removeListener: (channel, func) => ipcRenderer.removeListener(channel, func),
});

// 새 창 열기/닫기
contextBridge.exposeInMainWorld('newWindow', {
  open: (type) => ipcRenderer.send('newWindow', type),
  close: () => ipcRenderer.send('close-sub-window'),
});

// 마우스 관련
contextBridge.exposeInMainWorld('mouse', {
  Move: (type) => {
    console.log('마우스 이동 컨트롤.');
    ipcRenderer.send('mouseMove', type);
  },
  StartGet: () => {
    console.log('마우스포지션모니터링시작');
    ipcRenderer.send('startGetMousePosition');
  },
  StopGet: () => {
    console.log('마우스포지션모니터링종료');
    ipcRenderer.send('stopGetMousePosition');
  },
  monitor: (callback) => {
    ipcRenderer.on('mose-position', (event, pos) => {
      callback(pos);
    });
  },
  click : ()=>{
    console.log('마우스 클릭');
    ipcRenderer.send('mouseClick');
  }
});

// 색상 변경 메시지 전송
contextBridge.exposeInMainWorld('colorControl', {
  changeColor: (index) => ipcRenderer.send('subwindow-color-change', index),
  onColorUpdate: (callback) => ipcRenderer.on('update-color', (event, index) => callback(index)),
});
//서브창에 원 개수 변경 메시지 전송
contextBridge.exposeInMainWorld('circleControl', {
  changeCircleNum: (count) => {
    ipcRenderer.send('send-circle-count', count);
  },
});
// 서브창에 원 개수 변경 메시지 전송
contextBridge.exposeInMainWorld('viewAngleControl', {
  onReceiveCount: (callback) => {
    ipcRenderer.on('circle-count', (event, count) => {
      callback(count);
    });
  },
});

contextBridge.exposeInMainWorld('contrastControl', {
  changeDirection: (direction) => ipcRenderer.send('direction', direction),
  onReceiveDirection: (callback) => ipcRenderer.on('set-direction', (event, dir) => callback(dir)),
});


contextBridge.exposeInMainWorld('index', {
  changeIndex: (direction) => ipcRenderer.send('changeIndex', direction),
  onReceiveIndex: (callback) => ipcRenderer.on('set-changeIndex', (event, dir) => callback(dir)),
});

contextBridge.exposeInMainWorld('color', {
  send: (colorType, colorValue) => ipcRenderer.send('changeColor', { type: colorType, value: colorValue }),
  onReceive: (callback) => ipcRenderer.on('respond', (event, msg) => callback(msg)),
});


