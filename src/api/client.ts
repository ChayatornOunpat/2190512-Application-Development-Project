import { Platform } from 'react-native';

type UnauthorizedHandler = () => void | Promise<void>;
type ForbiddenHandler = () => void | Promise<void>;
type TokenProvider = () => string | null;

type ResponseType = 'json' | 'arrayBuffer' | 'none';

export type ApiRequestOptions = {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
  responseType?: ResponseType;
  skipAuth?: boolean;
  skipAuthReset?: boolean;
};

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

let getAccessToken: TokenProvider = () => null;
let handleUnauthorized: UnauthorizedHandler = () => {};
let handleForbidden: ForbiddenHandler = () => {};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function resolveApiBaseUrl(): string {
  const envBaseUrl = (
    globalThis as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env?.EXPO_PUBLIC_API_BASE_URL;

  if (envBaseUrl) {
    return trimTrailingSlash(envBaseUrl);
  }

  if (Platform.OS === 'web') {
    const location = (
      globalThis as {
        location?: { hostname?: string; protocol?: string };
      }
    ).location;
    const protocol = location?.protocol === 'https:' ? 'https:' : 'http:';
    const hostname = location?.hostname || 'localhost';
    return `${protocol}//${hostname}:5000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  return 'http://127.0.0.1:5000';
}

const API_BASE_URL = resolveApiBaseUrl();

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function isArrayBuffer(body: unknown): body is ArrayBuffer {
  return typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer;
}

async function parseError(response: Response): Promise<ApiError> {
  let detail: unknown = null;

  try {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      detail = await response.json();
    } else {
      const text = await response.text();
      detail = text || null;
    }
  } catch {
    detail = null;
  }

  let message = response.statusText || `Request failed (${response.status})`;
  if (
    detail &&
    typeof detail === 'object' &&
    'error' in detail &&
    typeof (detail as { error?: unknown }).error === 'string'
  ) {
    message = (detail as { error: string }).error;
  } else if (typeof detail === 'string' && detail) {
    message = detail;
  }

  return new ApiError(message, response.status, detail);
}

export function configureApiAuth(options: {
  getAccessToken: TokenProvider;
  onUnauthorized: UnauthorizedHandler;
  onForbidden?: ForbiddenHandler;
}): void {
  getAccessToken = options.getAccessToken;
  handleUnauthorized = options.onUnauthorized;
  handleForbidden = options.onForbidden || (() => {});
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function getWebSocketBaseUrl(): string {
  if (API_BASE_URL.startsWith('https://')) {
    return `wss://${API_BASE_URL.slice('https://'.length)}`;
  }
  if (API_BASE_URL.startsWith('http://')) {
    return `ws://${API_BASE_URL.slice('http://'.length)}`;
  }
  return API_BASE_URL;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = options.skipAuth ? null : getAccessToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    if (typeof options.body === 'string' || isFormData(options.body) || isArrayBuffer(options.body)) {
      body = options.body as BodyInit;
    } else {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(options.body);
    }
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      method: options.method || (body ? 'POST' : 'GET'),
      headers,
      body,
    });
  } catch (error) {
    throw new ApiError((error as Error).message || 'Network request failed', 0, error);
  }

  if (!response.ok) {
    const error = await parseError(response);
    if (response.status === 401 && !options.skipAuthReset) {
      await handleUnauthorized();
    } else if (response.status === 403) {
      await handleForbidden();
    }
    throw error;
  }

  if ((options.responseType || 'json') === 'none') {
    return undefined as T;
  }

  if (options.responseType === 'arrayBuffer') {
    return (await response.arrayBuffer()) as T;
  }

  return (await response.json()) as T;
}

export async function apiJson<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return apiRequest<T>(path, { ...options, responseType: 'json' });
}

export async function apiArrayBuffer(path: string, options: ApiRequestOptions = {}): Promise<ArrayBuffer> {
  return apiRequest<ArrayBuffer>(path, { ...options, responseType: 'arrayBuffer' });
}

export async function apiVoid(path: string, options: ApiRequestOptions = {}): Promise<void> {
  await apiRequest(path, { ...options, responseType: 'none' });
}
