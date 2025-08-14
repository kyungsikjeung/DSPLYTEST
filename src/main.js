const { app, BrowserWindow, ipcMain, session, Notification, screen } = require('electron');
const path = require('node:path');
const {
  mouse,
} = require('@nut-tree-fork/nut-js');

// IPC 핸들러 모듈들
const { setupSubWindowHandlers, cleanupSubWindowHandlers } = require('./ipc/subWindowHandlers');
const { setupMouseHandlers, cleanupMouseHandlers } = require('./ipc/mouseHandlers');
const { setupWindowHandlers, cleanupWindowHandlers } = require('./ipc/windowHandlers');
const { setupSerialHandlers, cleanupSerialHandlers } = require('./ipc/serialHandlers');
const { setupNotificationHandlers, cleanupNotificationHandlers, showNotification } = require('./ipc/notificationHandlers');

let mainWindow = null;
/* Serial Event */
const receivedEvent = require("./services/event/event.js")
const setupEventListeners = () => {
  receivedEvent.on('close', (data) => {
    console.log('Serial Connection closed:', data);
    showNotification('포트상태', '포트가 닫혔습니다.');
    mainWindow.webContents.send('port-close', null);
  });

  receivedEvent.on('open', (data) => {
    console.log('Serial Connection opened:', data);
    showNotification('포트상태', '포트가 열렸습니다.');
    mainWindow.webContents.send('port-open', null);
  });

  receivedEvent.on('error', (data) => {
    console.log('Serial Connection error:', data);
    showNotification('포트상태', '포트에러가 발생했습니다.');
    mainWindow.webContents.send('port-err', null);
  });

  receivedEvent.on('data-received', (data) => {
    console.log(`Data from serial received: ${data}`);
    if (data.trim()) {
      mainWindow.webContents.send('serial-data', data);
    }
  });

  ipcMain.on('message', (msg) => {
    const { nTitle, nBody } = msg;
    showNotification(nTitle, nBody);
  });

  ipcMain.on('subwindow', (evt, msg) => {
    evt.sender.send('respond', msg);
  });

};

let subWindow;
let prevUrl = null;
let currentUrl = null;
//  모니터 정보 전역변수
var monitorX = 0;
var monitorY = 0;
var monitorWidth = 0;
var monitorHeight = 0;
var nx = 0;
var ny = 0;

// express 서버 실행
const server = require('./server.js');
if (require('electron-squirrel-startup')) {
  app.quit();
}
const createSubWindow = (url, monitorInfo) => {
  // 서브 윈도우 만들어 질때
  currentUrl = url;
  console.log('createSubwindow Url인자:' + url);
  
  if (monitorInfo) {
    monitorX = monitorInfo.x;
    monitorY = monitorInfo.y;
    monitorWidth = monitorInfo.width;
    monitorHeight = monitorInfo.height;
    nx = monitorInfo.nativeOrigin.x;
    ny = monitorInfo.nativeOrigin.y;
  }
  
  if (subWindow && !subWindow.isDestroyed()) {
    console.log('[main] 이미 서브 창이 열려 있음. URL 업데이트 및 포커스.');
    if (prevUrl == currentUrl) {
      console.log('동일한 서브 페이지 열고 있습니다.');
    } else {
      console.log('서브 페이지가 다릅니다. URL 업데이트.');
      subWindow.loadURL(url);
      prevUrl = url;
    }
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

// 서브 윈도우 관련 함수들
const getSubWindow = () => subWindow;

// 메인 윈도우
const createWindow = () => {
   mainWindow = new BrowserWindow({
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

  // IPC 핸들러 설정
  serialSubscription = setupSerialHandlers();
  setupNotificationHandlers();
  setupSubWindowHandlers(getSubWindow);
  setupMouseHandlers(mainWindow);
  setupWindowHandlers(createSubWindow, getSubWindow);

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
  setupEventListeners();
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // IPC 핸들러 정리
  cleanupSerialHandlers();
  cleanupNotificationHandlers();
  cleanupSubWindowHandlers();
  cleanupMouseHandlers();
  cleanupWindowHandlers();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
