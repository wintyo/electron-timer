import React, { useState, useReducer, useEffect } from 'react';
import { hot } from 'react-hot-loader';
import { sum, padStart } from 'lodash-es';

import * as styles from './css/App.scss';

// utils
import File from '../utils/File';

// interfaces
import { IIPCData } from '../../../common/interfaces/IPC';

/** 期間データを持つ時間リスト */
interface IPeriodTime {
  /** 開始時刻 */
  startTime: number;
  /** 終了時刻 */
  endTime: number | null;
};

/** ラップ時間情報 */
interface ILapTime {
  /** 時間 */
  time: number;
}

/**
 * 時間を計算する
 * @param periodTimes - 期間データを持つ時間リスト
 */
function calcTimeCount(periodTimes: Array<IPeriodTime>) {
  if (periodTimes.length <= 0) {
    return 0;
  }
  const now = performance.now();

  return sum((periodTimes.map((periodTime) => {
    const endTime = periodTime.endTime !== null ? periodTime.endTime : now;
    return endTime - periodTime.startTime;
  })));
}

/**
 * 時間をフォーマットする
 * @param time - 時間
 */
function formatTime(time: number) {
  const milliSeconds = Math.floor(time) % 1000;
  const seconds = Math.floor(time / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const hoursStr = padStart(String(hours), 2, '0');
  const minutesStr = padStart(String(minutes % 60), 2, '0');
  const secondsStr = padStart(String(seconds % 60), 2, '0');
  const milliSecondsStr = padStart(String(Math.floor(milliSeconds / 10)), 2, '0');

  return `${hoursStr}:${minutesStr}:${secondsStr}.${milliSecondsStr}`;
}

const App = () => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [ipcData, setIpcData] = useState<IIPCData | null>(null);
  const [isTimeCounting, setIsTimeCounting] = useState(false);
  const [periodTimes, setPeriodTimes] = useState<Array<IPeriodTime>>([]);
  const [lapTimes, setLapTimes] = useState<Array<ILapTime>>([]);

  useEffect(() => {
    if (window.IPC == null) {
      return;
    }
    window.IPC.loadIpcData()
      .then((data) => {
        setIpcData(data);
      });
    window.IPC.onReceiveData((data) => {
      setIpcData(data);
    });
  }, []);

  useEffect(() => {
    if (!isTimeCounting) {
      return;
    }

    const intervalId = window.setInterval(() => {
      forceUpdate();
    }, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [isTimeCounting]);

  /**
   * 最前面にするかの状態をトグルする
   */
  const toggleIsAlwaysTop = () => {
    if (window.IPC == null || ipcData == null) {
      return;
    }
    window.IPC.setIsAlwaysTop(!ipcData.isAlwaysTop);
  }

  /**
   * タイマーの開始
   */
  const startTimer = () => {
    setPeriodTimes(periodTimes.concat({
      startTime: performance.now(),
      endTime: null,
    }));
    setIsTimeCounting(true);
  };

  /**
   * タイマーの一時停止
   */
  const stopTimer = () => {
    const lastPeriodTime: IPeriodTime | undefined = periodTimes[periodTimes.length - 1];
    if (lastPeriodTime == null) {
      return;
    }
    setIsTimeCounting(false);
    setPeriodTimes(periodTimes.slice(0, -1).concat({
      ...lastPeriodTime,
      endTime: performance.now(),
    }));
  };

  /**
   * 次のラップに進める
   */
  const nextLapTimer = () => {
    setLapTimes(lapTimes.concat({
      time: calcTimeCount(periodTimes),
    }));
    setPeriodTimes(([] as Array<IPeriodTime>).concat({
      startTime: performance.now(),
      endTime: null,
    }));
  };

  /**
   * リセットする
   */
  const reset = () => {
    setLapTimes([]);
    setPeriodTimes([]);
  };

  /**
   * ダウンロードする
   */
  const download = () => {
    const headerText = ['ラップ', 'ラップタイム', '合計時間'].join(',');
    const contentText = lapTimes.map((lapTime, index) => {
      const totalTime = sum(lapTimes.slice(0, index + 1).map((_lapTime) => _lapTime.time));
      return `${index + 1},${formatTime(lapTime.time)},${formatTime(totalTime)}`;
    }).join('\n');
    const csvText = [headerText, contentText].join('\n');
    File.download('timer.csv', csvText, 'text/csv');
  };

  const timeCount = calcTimeCount(periodTimes);
  return (
    <div>
      <h1>ストップウォッチ</h1>
      {ipcData ? (
        <div>
          <button onClick={toggleIsAlwaysTop}>前面{ipcData.isAlwaysTop ? '解除' : '固定'}</button>
        </div>
      ) : null}
      <div>{formatTime(timeCount)}</div>
      <div>
        <button
          onClick={isTimeCounting ? stopTimer : startTimer}
        >
          {isTimeCounting ? '一時停止' : '開始'}
        </button>
        <button
          onClick={isTimeCounting ? nextLapTimer : reset}
        >
          {isTimeCounting ? 'ラップ' : 'リセット'}
        </button>
        <button onClick={download}>ダウンロード</button>
      </div>
      <div className={styles.lapTimeTable}>
        <div className={styles.lapTimeRow}>
          <div className={styles.lapTimeRow__cell}>ラップ</div>
          <div className={styles.lapTimeRow__cell}>ラップタイム</div>
          <div className={styles.lapTimeRow__cell}>合計時間</div>
        </div>
        {lapTimes.map((lapTime, index) => {
          const totalTime = sum(lapTimes.slice(0, index + 1).map((_lapTime) => _lapTime.time));
          return (
            <div key={index} className={styles.lapTimeRow}>
              <div className={styles.lapTimeRow__cell}>{index + 1}</div>
              <div className={styles.lapTimeRow__cell}>{formatTime(lapTime.time)}</div>
              <div className={styles.lapTimeRow__cell}>{formatTime(totalTime)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default hot(module)(App);
