import sleep from '../utils/sleep';
type pollReturn = {
  pause: () => any;
  resume: () => any;
  updateInterval: (interval: number) => any;
};

const poll = (
  func: () => any,
  callback: (resp: any) => any,
  interval = 1000,
): pollReturn => {
  let active = true;
  let _interval = interval;

  const pause = () => {
    active = false;
  };

  const resume = () => {
    if (!active) {
      active = true;
      handle();
    }
  };

  const updateInterval = (interval: number) => {
    _interval = interval;
  };

  const handle = async () => {
    if (active) {
      try {
        const resp = await func();
        callback(resp);
      } catch (err) {
        //do nothing
      }

      await sleep(_interval);
      handle();
    }
  };

  handle();

  return {
    pause,
    resume,
    updateInterval,
  };
};

export default poll;
