import { RequestMethod, RequestOptions, RequestBody } from '../types';

type fetcherrorprops = { status?: number; data?: any };

export class fetcherror extends Error {
  status?: number;
  data?: any;
  constructor(message: string, props: fetcherrorprops = {}) {
    super(message);
    this.name = 'FetchError';
    this.status = props.status;
    this.data = props.data;
  }
}

const makeRequest = async <T>(
  url: string,
  method: RequestMethod,
  body: RequestBody | '' = '',
  options: RequestOptions = {},
  timeout = 0,
): Promise<T> => {
  const defaultheaders = {
    'content-type': 'application/json',
    accept: 'application/json',
  };

  const { headers, signal, ...rest } = options as any;
  const controller = new AbortController();
  const mergedsignal = controller.signal;
  let timeoutid: any;

  try {
    if (timeout > 0) timeoutid = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(url, {
      method,
      headers: {
        ...defaultheaders,
        ...headers,
      },
      ...(body && { body: JSON.stringify(body) }),
      signal: mergedsignal,
      ...rest,
    });

    if (!res.ok) {
      let parsed: any = null;
      try {
        parsed = await res.json();
      } catch (e) {
        try {
          parsed = await res.text();
        } catch (e2) {
          parsed = null;
        }
      }

      const message = parsed && parsed.message ? parsed.message : res.statusText || 'request failed';
      throw new fetcherror(message, { status: res.status, data: parsed });
    }

    const text = await res.text();
    if (!text) return undefined as any;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as any as T;
    }
  } catch (err: any) {
    if (err && err.name === 'AbortError') throw new fetcherror('request aborted');
    if (err && (err.name === 'FetchError' || (typeof err === 'object' && err !== null && 'status' in err))) throw err;
    if (err instanceof fetcherror) throw err;
    throw new fetcherror(err && err.message ? err.message : 'network error');
  } finally {
    if (timeoutid) clearTimeout(timeoutid);
  }
};

export default makeRequest;
