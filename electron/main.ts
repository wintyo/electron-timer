import path from 'path';
import { promises as fsPromises } from 'fs';
import { format as formatDate } from 'date-fns';
import { BrowserWindow, app, ipcMain } from 'electron';

// interfaces
import { IIPCData } from '../common/interfaces/IPC';

let win: BrowserWindow | null = null;
let data: IIPCData = {
  isAlwaysTop: false,
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
    },
  });

  if (process.env.NODE_ENV === 'development') {
    await win.loadURL('http://localhost:9040');
  } else {
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
