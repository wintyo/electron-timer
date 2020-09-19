export interface IIPCData {
  isAlwaysTop: boolean;
}

/** IPC通信の型 */
export interface IIPC {
  /** 常に最前面かのフラグとトグルする */
  setIsAlwaysTop: (isAlwaysTop: boolean) => void;
  /** IPC経由でデータを取得する */
  loadIpcData: () => Promise<IIPCData>;
  /** IPC経由でデータが送信された時 */
  onReceiveData: (receiver: (data: IIPCData) => void) => void;
}
