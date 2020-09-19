import { contextBridge, ipcRenderer } from 'electron';

// interfaces
import { IIPC, IIPCData } from '../common/interfaces/IPC';

const IPC: IIPC = {
  setIsAlwaysTop: (isAlwaysTop) => {
    ipcRenderer.send('setIsAlwaysTop', isAlwaysTop);
  },
  loadIpcData: () => {
    return new Promise((resolve) => {
      ipcRenderer.send('loadIpcData');
      ipcRenderer.once('res:loadIpcData', (event, data: IIPCData) => {
        resolve(data);
      });
    });
  },
  onReceiveData: (receiver) => {
    ipcRenderer.on('receiveData', (event, data: IIPCData) => {
      receiver(data);
    });
  }
};

contextBridge.exposeInMainWorld('IPC', IPC);

export default IPC;
