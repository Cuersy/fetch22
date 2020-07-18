import { RequestMethod, RequestOptions, RequestBody } from '../types';
const makeRequest = async <T>(
  url: string,
  method: RequestMethod,
  body: RequestBody | '' = '',
  options: RequestOptions = {},
): Promise<T> => {
  const defaultHeaders = {
    'Content-type': 'application/json',
    Accept: 'application/json',
  };

  const { headers, ...rest } = options;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      ...(body && { body: JSON.stringify(body) }),
      ...rest,
    });

    if (!res.ok) {
      const json = await res.json();
      throw {
        status: res.status,
        message: json.message,
      };
    }

    return res.json();
  } catch (err) {
    throw err;
  }
};

export default makeRequest;
