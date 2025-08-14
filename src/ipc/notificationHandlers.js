/**
 * @file notificationHandlers.js
 * @description 알림 관련 IPC 핸들러들
 */

const { ipcMain, Notification } = require('electron');

/**
 * 알림 표시 함수
 * @param {string} nTitle - 알림 제목
 * @param {string} nBody - 알림 내용
 */
function showNotification(nTitle, nBody) {
  const notification = new Notification({
    title: nTitle,
    body: nBody,
  });
  notification.show();
  setTimeout(() => {
    notification.close();
  }, 2000);
}

/**
 * 알림 관련 IPC 핸들러 설정
 */
function setupNotificationHandlers() {
  // 알림 메시지 처리
  ipcMain.on('message', (event, msg) => {
    const { nTitle, nBody } = msg;
    showNotification(nTitle, nBody);
  });
}

/**
 * 알림 핸들러 정리
 */
function cleanupNotificationHandlers() {
  ipcMain.removeAllListeners('message');
 }

module.exports = {
  setupNotificationHandlers,
  cleanupNotificationHandlers,
  showNotification
};
