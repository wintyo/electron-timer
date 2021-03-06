import path from 'path';
import { promises as fsPromises } from 'fs';
import { format as formatDate } from 'date-fns';
import { BrowserWindow, app, ipcMain, screen } from 'electron';

// interfaces
import { IIPCData } from '../common/interfaces/IPC';

let win: BrowserWindow | null = null;
let data: IIPCData = {
  isAlwaysTop: true,
};

// アプリケーションの二重起動というよりBrowserWindowの二重起動だったのでこのチェックはなくても問題なさそう
// const gotTheLock = app.requestSingleInstanceLock();
// if (!gotTheLock) {
//   app.quit();
// } else {
//   app.on('second-instance', (event) => {
//     console.log('second');
//   });
//
//   app.whenReady().then(createWindow);
// }

/**
 * 所定の位置に移動する
 * @param browserWindow - ブラウザウィンドウ
 */
function movePosition(browserWindow: BrowserWindow) {
  const firstDisplay = screen.getAllDisplays()[0];
  const displayBounds = firstDisplay.bounds;
  const browserBounds = browserWindow.getBounds();
  browserWindow.setPosition(
    displayBounds.x + displayBounds.width - browserBounds.width,
    displayBounds.y
  );
}

async function createWindow() {
  if (win != null) {
    return;
  }
  win = new BrowserWindow({
    alwaysOnTop: data.isAlwaysTop,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, './preload.js'),
      worldSafeExecuteJavaScript: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    await win.loadURL('http://localhost:9040');
  } else {
    win.setSize(400, 350);
    movePosition(win);
    await win.loadFile('out/index.html');
  }
}

app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  win = null;
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows.length === 0) {
    createWindow();
  }
});

ipcMain.on('loadIpcData', (event) => {
  event.sender.send('res:loadIpcData', data);
})

ipcMain.on('setIsAlwaysTop', async (event, isAlwaysTop: boolean) => {
  if (win == null) {
    return;
  }
  data.isAlwaysTop = isAlwaysTop;
  win.setAlwaysOnTop(isAlwaysTop);
  event.sender.send('receiveData', data);
});
