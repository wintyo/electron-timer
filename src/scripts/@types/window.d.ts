import { IIPC } from '../../../common/interfaces/IPC';

declare global {
  interface Window {
    IPC?: IIPC;
  }
}
