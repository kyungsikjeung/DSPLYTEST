/**
 * @file serialHandlers.js
 * @description 시리얼 통신 관련 IPC 핸들러들
 */

const { ipcMain } = require('electron');

/**
 * 시리얼 관련 IPC 핸들러 설정
 */
function setupSerialHandlers() {
  let isRendererSubscribed = false;

  // 시리얼 구독
  ipcMain.on('subscribe-to-serial', (evt, page) => {
    console.log(`${page} 페이지에서 시리얼 데이터를 구독합니다.`);
    isRendererSubscribed = true;
  });

  // 시리얼 구독 해지
  ipcMain.on('unsubscribe-from-serial', () => {
    console.log('시리얼 데이터 구독을 해지합니다.');
    isRendererSubscribed = false;
  });

  // 일반 메시지 처리
  ipcMain.on('subwindow', (evt, msg) => {
    evt.sender.send('respond', msg);
  });

  console.log('✅ 시리얼 IPC 핸들러가 설정되었습니다.');

  return {
    isSubscribed: () => isRendererSubscribed,
    setSubscription: (value) => { isRendererSubscribed = value; }
  };
}

/**
 * 시리얼 핸들러 정리
 */
function cleanupSerialHandlers() {
  ipcMain.removeAllListeners('subscribe-to-serial');
  ipcMain.removeAllListeners('unsubscribe-from-serial');
  ipcMain.removeAllListeners('subwindow');
  console.log('🧹 시리얼 IPC 핸들러가 정리되었습니다.');
}

module.exports = {
  setupSerialHandlers,
  cleanupSerialHandlers
};
