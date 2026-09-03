import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { message } from 'antd';

/** 后端统一响应结构，可按实际接口调整 */
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

/** ts-gear 生成代码传入的请求参数 */
export type RequestOption = {
  method?: string;
  body?: unknown;
  query?: Record<string, unknown>;
  path?: Record<string, string | number | boolean>;
  header?: HeadersInit;
  formData?: Record<string, Blob | string>;
  /** 是否附带 Authorization，默认 true */
  auth?: boolean;
  signal?: AbortSignal;
};

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;

    // 无业务 code 时直接返回（兼容非统一封装接口）
    if (res == null || typeof res !== 'object' || !('code' in res)) {
      return response;
    }

    if (res.code === 0 || res.code === 200) {
      return response;
    }

    message.error(res.message || '请求失败');
    return Promise.reject(new Error(res.message || '请求失败'));
  },
  (error: AxiosError<ApiResponse>) => {
    const status = error.response?.status;
    const msg = error.response?.data?.message || error.message || '网络异常，请稍后重试';

    if (status === 401) {
      message.error('登录已过期，请重新登录');
      localStorage.removeItem('token');
    } else {
      message.error(msg);
    }

    return Promise.reject(error);
  },
);

/** 将 `/user/:id` + `{ path: { id } }` 编译为实际路径 */
function resolvePath(url: string, path?: RequestOption['path']): string {
  if (!path) return url;
  let resolved = url;
  for (const [key, value] of Object.entries(path)) {
    resolved = resolved.replace(
      new RegExp(`:${key}(?=/|$)`, 'g'),
      encodeURIComponent(String(value)),
    );
  }
  return resolved;
}

function headersInitToRecord(header?: HeadersInit): Record<string, string> | undefined {
  if (!header) return undefined;
  if (header instanceof Headers) {
    return Object.fromEntries(header.entries());
  }
  if (Array.isArray(header)) {
    return Object.fromEntries(header);
  }
  return { ...header };
}

/**
 * ts-gear 兼容的请求函数：`request(url, { method, body, query, path, ... })`
 */
export async function request<T = unknown>(url: string, option: RequestOption = {}): Promise<T> {
  const method = (option.method ?? 'GET').toUpperCase();
  const headers = headersInitToRecord(option.header);

  let data: unknown = option.body;
  if (option.formData) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(option.formData)) {
      formData.append(key, value);
    }
    data = formData;
  }

  const res = await http.request<T>({
    url: resolvePath(url, option.path),
    method,
    data,
    params: option.query,
    headers,
    signal: option.signal,
  });

  return res.data;
}

export function get<T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return http.get<ApiResponse<T>>(url, config).then((res) => res.data);
}

export function post<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return http.post<ApiResponse<T>>(url, data, config).then((res) => res.data);
}

export function put<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return http.put<ApiResponse<T>>(url, data, config).then((res) => res.data);
}

export function del<T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return http.delete<ApiResponse<T>>(url, config).then((res) => res.data);
}

export default http;
