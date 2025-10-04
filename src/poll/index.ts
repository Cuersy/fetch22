import sleep from '../utils/sleep';

type pollreturn = {
  pause: () => void;
  resume: () => void;
  updateinterval: (interval: number) => void;
  stop: () => Promise<void>;
};

const poll = (
  func: () => Promise<any>,
  callback: (resp: any) => void,
  interval = 1000,
): pollreturn => {
  let active = true;
  let _interval = interval;
  let stopped = false;
  let stopperResolve: (() => void) | null = null;

  const pause = () => {
    active = false;
  };

  const resume = () => {
    if (!active && !stopped) {
      active = true;
      handle();
    }
  };

  const updateinterval = (interval: number) => {
    _interval = interval;
  };

  const stop = () =>
    new Promise<void>((resolve) => {
      stopped = true;
      active = false;
      if (stopperResolve) {
        stopperResolve();
        stopperResolve = null;
      }
      resolve();
    });

  const handle = async () => {
    while (active && !stopped) {
        try {
          const resp = await func();
          try {
            callback(resp);
          } catch (err) {}
        } catch (err) {}

        await sleep(_interval);
      }

    if (stopped && stopperResolve) {
      stopperResolve();
      stopperResolve = null;
    }
  };

  handle();

  return {
    pause,
    resume,
    updateinterval,
    stop,
  };
};

export default poll;
