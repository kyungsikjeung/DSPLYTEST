/**
 * @file windowHandlers.js
 * @description 윈도우 관련 IPC 핸들러들
 */

const { ipcMain, screen } = require('electron');

/**
 * 윈도우 관련 IPC 핸들러 설정
 * @param {function} createSubWindow - 서브윈도우 생성 함수
 * @param {function} getSubWindow - 서브윈도우 인스턴스를 반환하는 함수
 */
function setupWindowHandlers(createSubWindow, getSubWindow) {
  // 새 윈도우 생성
  ipcMain.on('newWindow', (event, msg) => {
    console.log('got message from IpcRenderer');
    console.log(msg);
    
    const displays = screen.getAllDisplays();
    console.log(JSON.stringify(displays));

    let externalDisplay = displays.find((display) => {
      // 1920x720 해상도 모니터 찾기
      return display.bounds.width == 1920 && display.bounds.height == 720;
    });

    // 만약 external Display 없을 시, 개발용
    if (!externalDisplay) {
      externalDisplay = screen.getPrimaryDisplay(); // 기본 모니터 사용 - ex. 노트북
    }else{
      console.log(JSON.stringify(externalDisplay));
    }


    const monitorInfo = {
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y,
      width: externalDisplay.bounds.width,
      height: externalDisplay.bounds.height,
      nativeOrigin: {
        x: externalDisplay.nativeOrigin.x,
        y: externalDisplay.nativeOrigin.y
      }
    };

    console.log(MAIN_WINDOW_WEBPACK_ENTRY + '#/subwindow1');
    const urlPath = MAIN_WINDOW_WEBPACK_ENTRY + `#/${msg}`;
    console.log('newwindow' + urlPath);
    
    createSubWindow(urlPath, monitorInfo);
  });

  // 서브 윈도우 열기
  ipcMain.on('open-sub-window', (event, url) => {
    console.log('open-sub-window:' + url);
    const subWindow = getSubWindow();
    if (!subWindow) {
      createSubWindow(url);
    } else {
      // url diff, 서브창이 존재하지 않거나 이미 파괴됨. 새로 열어야 함
      console.log('서브창이 이미 존재합니다.');
    }
  });

  // 서브 윈도우 닫기
  ipcMain.on('close-sub-window', () => {
    const subWindow = getSubWindow();
    subWindow?.close();
  });

  console.log('윈도우 IPC 핸들러가 설정되었습니다.');
}

/**
 * 윈도우 핸들러 정리
 */
function cleanupWindowHandlers() {
  ipcMain.removeAllListeners('newWindow');
  ipcMain.removeAllListeners('open-sub-window');
  ipcMain.removeAllListeners('close-sub-window');
  console.log('🧹 윈도우 IPC 핸들러가 정리되었습니다.');
}

module.exports = {
  setupWindowHandlers,
  cleanupWindowHandlers
};
