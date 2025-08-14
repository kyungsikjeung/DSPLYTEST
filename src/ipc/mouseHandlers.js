/**
 * @file mouseHandlers.js
 * @description 마우스 관련 IPC 핸들러들
 */

const { ipcMain } = require('electron');
const { Button, mouse, Point } = require('@nut-tree-fork/nut-js');

/**
 * 마우스 관련 IPC 핸들러 설정
 * @param {BrowserWindow} mainWindow - 메인 윈도우 인스턴스
 */
function setupMouseHandlers(mainWindow) {
  let mouseInterval = null;

  // 마우스 이동
  ipcMain.on('mouseMove', (event, type) => {
    console.log(`마우스 위치 → x: ${type.x}, y: ${type.y}`);
    mouse.setPosition(new Point(type.x, type.y));
  });

  // 마우스 클릭
  ipcMain.on('mouseClick', (event, type) => {
    console.log(`마우스 클릭 - main`);
    mouse.click(Button.LEFT);
  });

  // 마우스 위치 추적 시작
  ipcMain.on('startGetMousePosition', () => {
    console.log('마우스 위치 get.');
    if (mouseInterval == null) {
      mouseInterval = setInterval(async () => {
        const pos = await mouse.getPosition();
        let time = new Date().toLocaleTimeString();
        console.log(`마우스 위치 →${time} x: ${pos.x}, y: ${pos.y}`);
        mainWindow.webContents.send('mose-position', pos);
      }, 100);
    }
  });

  // 마우스 위치 추적 중지
  ipcMain.on('stopGetMousePosition', () => {
    console.log('마우스 위치 이벤트를 중지합니다.');
    clearInterval(mouseInterval);
    mouseInterval = null;
  });

  console.log('마우스 IPC 핸들러가 설정되었습니다.');
}

/**
 * 마우스 핸들러 정리
 */
function cleanupMouseHandlers() {
  ipcMain.removeAllListeners('mouseMove');
  ipcMain.removeAllListeners('mouseClick');
  ipcMain.removeAllListeners('startGetMousePosition');
  ipcMain.removeAllListeners('stopGetMousePosition');
  console.log('마우스 IPC 핸들러가 정리되었습니다.');
}

module.exports = {
  setupMouseHandlers,
  cleanupMouseHandlers
};
