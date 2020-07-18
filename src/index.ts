import {
  RequestMethod,
  RequestOptions,
  FunctionObject,
  RequestBody,
} from './types';
import makeRequest from './utils/request';
import funcRetry from './utils/retry';
import poll from './poll';

const get = <T>(url: string, options?: RequestOptions): Promise<T> =>
  makeRequest(url, RequestMethod.GET, null, options);
const post = <T>(
  url: string,
  body: RequestBody,
  options?: RequestOptions,
): Promise<T> => makeRequest(url, RequestMethod.POST, body, options);
const put = <T>(
  url: string,
  body: RequestBody,
  options?: RequestOptions,
): Promise<T> => makeRequest(url, RequestMethod.PUT, body, options);
const del = <T>(url: string, options?: RequestOptions): Promise<T> =>
  makeRequest(url, RequestMethod.DELETE, null, options);

const methods: FunctionObject = {
  get: get,
  post: post,
  put: put,
  del: del,
};

const retry = (attempt?: number) => {
  const retryMethods: FunctionObject = {};

  Object.keys(methods).forEach((key: string) => {
    retryMethods[key] = (...args: any) =>
      funcRetry(methods[key].bind(null, args), attempt);
  });

  return retryMethods;
};

const fetch22 = {
  get,
  post,
  put,
  del,
  retry,
  poll,
};

export default fetch22;
