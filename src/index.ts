import { useEffect, useRef, useState } from 'react';
import { RequestMethod, RequestOptions, FunctionObject, RequestBody } from './types';
import makeRequest, { fetcherror } from './utils/request';
import funcretry from './utils/retry';
import poll from './poll';

const get = async <T>(url: string, options?: RequestOptions): Promise<T> =>
  makeRequest<T>(url, RequestMethod.GET, '', options, options?.timeout || 0);

const post = async <T>(url: string, body: RequestBody, options?: RequestOptions): Promise<T> =>
  makeRequest<T>(url, RequestMethod.POST, body, options, options?.timeout || 0);

const put = async <T>(url: string, body: RequestBody, options?: RequestOptions): Promise<T> =>
  makeRequest<T>(url, RequestMethod.PUT, body, options, options?.timeout || 0);

const del = async <T>(url: string, options?: RequestOptions): Promise<T> =>
  makeRequest<T>(url, RequestMethod.DELETE, '', options, options?.timeout || 0);

const retry = (attempt = 3, delay = 500) => {
  const list: FunctionObject = {};

  list.get = <T>(url: string, body?: RequestBody, options?: RequestOptions) =>
    funcretry(() => get<T>(url, options), attempt, delay);

  list.post = <T>(url: string, body?: RequestBody, options?: RequestOptions) =>
    funcretry(() => post<T>(url, body || {}, options), attempt, delay);

  list.put = <T>(url: string, body?: RequestBody, options?: RequestOptions) =>
    funcretry(() => put<T>(url, body || {}, options), attempt, delay);

  list.del = <T>(url: string, body?: RequestBody, options?: RequestOptions) =>
    funcretry(() => del<T>(url, options), attempt, delay);

  return list;
};

type usefetchresult<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
  abort: () => void;
  refetch: () => Promise<void>;
};

const usefetch = <T = any>(
  url: string,
  options?: RequestOptions,
  deps: any[] = [],
): usefetchresult<T> => {
  const controllerRef = useRef<AbortController | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetcher = async () => {
    setLoading(true);
    setError(null);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const resp = await makeRequest<T>(url, RequestMethod.GET, '', { ...options, signal: controller.signal }, options?.timeout || 0);
      setData(resp as T);
    } catch (err: any) {
      if (err && (err as any).name === 'FetchError' && (err as any).message === 'request aborted') {
        setError(err);
      } else {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetcher();
    return () => controllerRef.current?.abort();
  }, deps);

  const abort = () => controllerRef.current?.abort();
  const refetch = async () => fetcher();

  return { data, error, loading, abort, refetch };
};

const lib = { get, post, put, del, retry, poll, usefetch };

export default lib;
