import lib from '../src';

const mockResponse = (body: string, ok = true, status = 200, statusText = 'OK') => ({
  ok,
  status,
  statusText,
  text: async () => body,
  json: async () => {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  },
});

describe('fetch22 library', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('get should return parsed json when response is ok', async () => {
    const url = 'https://api.test/ok';
    (global as any).fetch.mockResolvedValueOnce(mockResponse(JSON.stringify({ hello: 'world' })));

    await expect(lib.get(url)).resolves.toEqual({ hello: 'world' });
    expect((global as any).fetch).toHaveBeenCalledTimes(1);
  });

  it('get should throw fetcherror with status and message when response not ok', async () => {
    const url = 'https://api.test/bad';
    (global as any).fetch.mockResolvedValueOnce(mockResponse(JSON.stringify({ message: 'bad' }), false, 400, 'Bad Request'));

    await expect(lib.get(url)).rejects.toMatchObject({ name: 'FetchError', status: 400, message: 'bad' });
    expect((global as any).fetch).toHaveBeenCalledTimes(1);
  });

  it('retry should retry until success', async () => {
    let call = 0;
    const url = 'https://api.test/retry';
    (global as any).fetch.mockImplementation(() => {
      call += 1;
      if (call < 3) return Promise.reject(new Error('network'));
      return Promise.resolve(mockResponse(JSON.stringify({ ok: true, value: 1 })));
    });

    const r = lib.retry(4, 1);
    await expect(r.get(url)).resolves.toEqual({ ok: true, value: 1 });
    expect((global as any).fetch).toHaveBeenCalledTimes(3);
  });

  it('poll should call func repeatedly and stop when requested', async () => {
    jest.useFakeTimers();
    const func = jest.fn().mockResolvedValue('pong');
    const callback = jest.fn();

    const controller = lib.poll(func, callback, 1000);

    await Promise.resolve();
    expect(func).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('pong');

    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(func).toHaveBeenCalledTimes(2);

    const stopPromise = controller.stop();
    jest.advanceTimersByTime(1000);
    await stopPromise;

    const callsAfterStop = func.mock.calls.length;
    jest.advanceTimersByTime(2000);
    expect(func).toHaveBeenCalledTimes(callsAfterStop);
  });
});
