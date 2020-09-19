import path from 'path';
import { promises as fsPromises } from 'fs';
import { format as formatDate } from 'date-fns';
import { BrowserWindow, app, ipcMain } from 'electron';

function createWindow() {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, './preload.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:9040');
  } else {
    win.loadFile('out/index.html');
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
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows.length === 0) {
    createWindow();
  }
});

ipcMain.on('loadMonthTexts', async (event, targetMonth: Date) => {
  try {
    const text = await fsPromises.readFile(path.resolve(app.getPath('userData'), `data/${formatDate(targetMonth, 'yyyy-MM')}.json`), {
      encoding: 'utf-8',
    });
    event.sender.send('res:loadMonthTexts', JSON.parse(text));
  } catch {
    event.sender.send('res:loadMonthTexts', {});
  }
});

ipcMain.on('saveMonthTexts', async (event, targetMonth: Date, textMap: { [dateStr: string]: string }) => {
  console.log(app.getPath('userData'));
  try {
    await fsPromises.mkdir(path.resolve(app.getPath('userData'), 'data'));
  } catch {
  }
  await fsPromises.writeFile(
    path.resolve(app.getPath('userData'), `data/${formatDate(targetMonth, 'yyyy-MM')}.json`),
    JSON.stringify(textMap, null, '  ')
  );
});
