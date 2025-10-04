type StringObject = {
  [key: string]: string;
};

export type RequestBody = {
  [key: string]: any;
};
export type FunctionObject = {
  [key: string]: <T>(
    url: string,
    body?: RequestBody,
    options?: RequestOptions,
  ) => Promise<T>;
};

export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
}

export type RequestOptions = {
  headers?: StringObject;
  timeout?: number;
  signal?: AbortSignal | null;
};
