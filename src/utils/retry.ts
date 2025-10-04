import sleep from './sleep';


const funcretry = async <T>(
  func: () => Promise<T>,
  attempt = 3,
  delay = 500,
): Promise<T> => {
  let lasterror: any;
  for (let i = 0; i < attempt; i++) {
    try {
      return await func();
    } catch (err) {
      lasterror = err;
      const backoff = delay * Math.pow(2, i);
      await sleep(backoff);
    }
  }

  throw lasterror;
};

export default funcretry;
