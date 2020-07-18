const sleep = <T>(time: number): Promise<T> =>
  new Promise((resolve) => setTimeout(resolve, time || 0));
export default sleep;
