import sleep from './sleep';
const funcRetry = async <T>(
  func: any,
  attempt = 3,
  delay = 500,
): Promise<T> => {
  const canRetry = attempt > 0;
  let resp;
  try {
    resp = await func();
  } catch (err) {
    if (canRetry) {
      await sleep(attempt * delay);
      return funcRetry(func, attempt - 1);
    }
    throw err;
  }

  return resp;
};

export default funcRetry;
