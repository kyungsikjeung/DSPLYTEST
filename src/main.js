const { app, BrowserWindow, ipcMain, session, Notification, screen } = require('electron');
const path = require('node:path');
const {
  Button,
  mouse,
  straightTo,
  centerOf,
  randomPointIn,
  Region,
  Point,
  right,
  down,
  left,
  up,
} = require('@nut-tree-fork/nut-js');

let isRendererSubscribed = false;
const serialEmitter = require('./server/serial/serialEmitter');

/* 클라이언트 IPC 통신 */
ipcMain.on('subscribe-to-serial', (evt, page) => {
  console.log(`${page} 페이지 에서 시리얼 데이터를 구독합니다.`);
  isRendererSubscribed = true;
});



ipcMain.on('message', (msg) => {
  const { nTitle, nBody } = msg;
  console.log(nTitle);
  console.log(nBody);
  showNotification(nTitle, nBody);
});

ipcMain.on('subwindow', (evt, msg) => {
  evt.sender.send('respond', msg);
});

// 🛠️ 색상 변경용 IPC 추가
ipcMain.on('subwindow-color-change', (event, colorIndex) => {
  if (subWindow && !subWindow.isDestroyed()) {
    subWindow.webContents.send('update-color', colorIndex);
  } else {
    console.log('[main] 서브창이 존재하지 않거나 이미 파괴됨. 새로 열어야 함.');
  }
});

ipcMain.on('send-circle-count', (event, count) => {
  if (subWindow && !subWindow.isDestroyed()) {
    console.log('서브창에 원 개수 전송:', count);
    subWindow.webContents.send('circle-count', count);
  }
});

// 패턴  ..  상하좌우
ipcMain.on('direction', (event, direction) => {
  if (subWindow && !subWindow.isDestroyed()) {
    subWindow.webContents.send('set-direction', direction);
  }
});

// 영상 Freeze 화면 송출 영상 인덱스 
ipcMain.on('changeIndex', (event, index) => {
  if (subWindow && !subWindow.isDestroyed()) {
    // main window  -> main -> subwindow
    subWindow.webContents.send('set-changeIndex', index);
  }
});


// 테스트 
ipcMain.on('changeColor', (event, data) => {
  if (subWindow && !subWindow.isDestroyed()) {
    // main window  -> main -> subwindow
    subWindow.webContents.send('respond', data);
  }
});



// 🖥️ 모니터 정보 전역변수
var monitorX = 0;
var monitorY = 0;
var monitorWidth = 0;
var monitorHeight = 0;
var nx = 0;
var ny = 0;

ipcMain.on('mouseMove', (event, type) => {
  console.log(`마우스 위치 → x: ${type.x}, y: ${type.y}`);
  mouse.setPosition(new Point(type.x, type.y));
});

ipcMain.on('mouseClick', (event, type) => {
  console.log(`마우스 클릭 - main `);  
  
  mouse.click(Button.LEFT);
});


ipcMain.on('newWindow', (event, msg) => {
  console.log('got message from IpcRenderer');
  console.log(msg);
  const displays = screen.getAllDisplays();
  console.log(JSON.stringify(displays));

  let externalDisplay = displays.find((display) => { // 1920x720 해상도 모니터 찾기 
    return display.bounds.width == 1920 && display.bounds.height == 720;
  });

  // 만약 external Display 없을 시 , 개발용
  if (!externalDisplay) { 
    externalDisplay = screen.getPrimaryDisplay(); // 기본 모니터 사용 - ex. 노트북
  }

  monitorX = externalDisplay.bounds.x; // 
  monitorY = externalDisplay.bounds.y;
  monitorWidth = externalDisplay.bounds.width;
  monitorHeight = externalDisplay.bounds.height;
  nx = externalDisplay.nativeOrigin.x;
  ny = externalDisplay.nativeOrigin.y;

  console.log(MAIN_WINDOW_WEBPACK_ENTRY + '#/subwindow1');
  const urlPaTh = MAIN_WINDOW_WEBPACK_ENTRY + `#/${msg}`;
  console.log('newwindow' + urlPaTh);
  createSubWindow(urlPaTh);
});

ipcMain.on('unsubscribe-from-serial', () => {
  console.log('시리얼 데이터를 구독을 해지합니다.');
  isRendererSubscribed = false;
});

// express 서버 실행
const server = require('./server/server.js');
if (require('electron-squirrel-startup')) {
  app.quit();
}

// 🖼️ 서브 윈도우
let subWindow;
let prevUrl = null;
let currentUrl = null;
const createSubWindow = (url) => {
  // 서브 윈도우 만들어 질떄
  currentUrl = url;
  console.log('createSubwindow Url인자:' + url);
  if (subWindow && !subWindow.isDestroyed()) {
    console.log('[main] 이미 서브 창이 열려 있음. URL 업데이트 및 포커스.');
    if (prevUrl == currentUrl) {
      console.log('동일한 서브 페이지 열고 있습니다.');
    } else {
      console.log('서브 페이지가 다릅니다. URL 업데이트.');
      subWindow.loadURL(url);
      prevUrl = url;
    }
    //subWindow.loadURL(url);
    //subWindow.focus();
    //subWindow.loadURL(url);
    return;
  }

  subWindow = new BrowserWindow({
    x: monitorX,
    y: monitorY,
    width: monitorWidth,
    height: monitorHeight,
    //width: 600,
    //height: 720,
    fullscreen: true,
    frame: false,
    // alwaysOnTop: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
    },
    autoHideMenuBar: true,
  });

  subWindow.once('ready-to-show', () => {
    subWindow.show();
  });

  subWindow.on('closed', () => {
    subWindow = null;
  });

  subWindow.loadURL(url);

  mouse.config.autoDelayMs = 0;
  mouse.config.mouseSpeed = 1000;
  //mouse.setPosition(new Point(nx + 10, ny + 10));
};

// 서브 윈도우 열고 닫기
ipcMain.on('open-sub-window', (url) => {
  console.log('open-sub-window:' + url);
  //
  if (!subWindow) {
    createSubWindow(url);
  } else {
    // url diff,서브창이 존재하지 않거나 이미 파괴됨. 새로 열어야 함
  }
});

ipcMain.on('close-sub-window', () => {
  subWindow?.close();
});

// 🏠 메인 윈도우
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    minWidth: 700,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      // contextIsolation: false,
    },
    autoHideMenuBar: true,
  });

  mainWindow.maximize();
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = [
      "connect-src 'self' http://localhost:3000 http://localhost:5000;",
      "img-src 'self' http://localhost:3000 http://localhost:5000 data:;",
    ].join(' ');

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
      },
    });
  });

  /* MCU에서 받은 데이터 클라이언트에 전달 */
  serialEmitter.on('data-received', (data) => {
    console.log(`Data from serial received: ${data}`);
    if (data.trim()) {
      mainWindow.webContents.send('serial-data', data);
    }
  });

  var mouseInterval;

  ipcMain.on('startGetMousePosition', () => {
    console.log('마우스 위치 get.');
    if (mouseInterval == null) {
      mouseInterval = setInterval(async () => {
        const pos = await mouse.getPosition();
        let time = new Date().toLocaleTimeString();
        console.log(`🖱️ 마우스 위치 →${time} x: ${pos.x}, y: ${pos.y}`);
        mainWindow.webContents.send('mose-position', pos);
      }, 100);
    }
  });

  ipcMain.on('stopGetMousePosition', () => {
    console.log('마우스 위치 이벤트를 중지합니다.');
    clearInterval(mouseInterval);
    mouseInterval = null;
  });

  serialEmitter.on('port-close', () => {
    showNotification('포트상태', '포트가 닫혔습니다.');
    mainWindow.webContents.send('port-close', null);
  });

  serialEmitter.on('port-err', (data) => {
    showNotification('포트에러', data);
    mainWindow.webContents.send('port-err', null);
  });

  serialEmitter.on('port-open', () => {
    showNotification('포트상태', '포트가 성공적으로 연결되었습니다.');
    mainWindow.webContents.send('port-open', null);
  });
};

// 알림
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

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
