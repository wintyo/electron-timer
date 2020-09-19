import { contextBridge, ipcRenderer } from 'electron';

const IPC = {
  loadMonthTexts: (targetMonth: Date) => {
    return new Promise((resolve) => {
      ipcRenderer.send('loadMonthTexts', targetMonth);
      ipcRenderer.once('res:loadMonthTexts', (event, monthTexts: Array<string>) => {
        resolve(monthTexts);
      });
    });
  },
  saveMonthTexts: (targetMonth: Date, textMap: { [dateStr: string]: string }) => {
    ipcRenderer.send('saveMonthTexts', targetMonth, textMap);
  }
};

contextBridge.exposeInMainWorld('IPC', IPC);

export default IPC;
