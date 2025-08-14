/**
 * @file subWindowHandlers.js
 * @description 서브윈도우 관련 IPC 핸들러들
 */

const { ipcMain } = require('electron');

/**
 * 서브윈도우 관련 IPC 핸들러 설정
 * @param {function} getSubWindow - 서브윈도우 인스턴스를 반환하는 함수
 */
function setupSubWindowHandlers(getSubWindow) {
  // 색상 변경용 IPC
  ipcMain.on('subwindow-color-change', (event, colorIndex) => {
    const subWindow = getSubWindow();
    if (subWindow && !subWindow.isDestroyed()) {
      subWindow.webContents.send('update-color', colorIndex);
    } else {
      console.log('[main] 서브창이 존재하지 않거나 이미 파괴됨. 새로 열어야 함.');
    }
  });

  // 원 개수 전송
  ipcMain.on('send-circle-count', (event, count) => {
    const subWindow = getSubWindow();
    if (subWindow && !subWindow.isDestroyed()) {
      console.log('서브창에 원 개수 전송:', count);
      subWindow.webContents.send('circle-count', count);
    }
  });

  // 패턴 방향 (상하좌우)
  ipcMain.on('direction', (event, direction) => {
    const subWindow = getSubWindow();
    if (subWindow && !subWindow.isDestroyed()) {
      subWindow.webContents.send('set-direction', direction);
    }
  });

  // 영상 Freeze 화면 송출 영상 인덱스
  ipcMain.on('changeIndex', (event, index) => {
    const subWindow = getSubWindow();
    if (subWindow && !subWindow.isDestroyed()) {
      // main window -> main -> subwindow
      subWindow.webContents.send('set-changeIndex', index);
    }
  });

  // 테스트용 색상 변경
  ipcMain.on('changeColor', (event, data) => {
    const subWindow = getSubWindow();
    if (subWindow && !subWindow.isDestroyed()) {
      // main window -> main -> subwindow
      subWindow.webContents.send('respond', data);
    }
  });

  console.log('✅ 서브윈도우 IPC 핸들러가 설정되었습니다.');
}

/**
 * 서브윈도우 핸들러 정리
 */
function cleanupSubWindowHandlers() {
  ipcMain.removeAllListeners('subwindow-color-change');
  ipcMain.removeAllListeners('send-circle-count');
  ipcMain.removeAllListeners('direction');
  ipcMain.removeAllListeners('changeIndex');
  ipcMain.removeAllListeners('changeColor');
  console.log('🧹 서브윈도우 IPC 핸들러가 정리되었습니다.');
}

module.exports = {
  setupSubWindowHandlers,
  cleanupSubWindowHandlers
};
