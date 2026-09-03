import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import { message } from 'antd'

/** 后端统一响应结构，可按实际接口调整 */
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data

    // 无业务 code 时直接返回（兼容非统一封装接口）
    if (res == null || typeof res !== 'object' || !('code' in res)) {
      return response
    }

    if (res.code === 0 || res.code === 200) {
      return response
    }

    message.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error: AxiosError<ApiResponse>) => {
    const status = error.response?.status
    const msg =
      error.response?.data?.message ||
      error.message ||
      '网络异常，请稍后重试'

    if (status === 401) {
      message.error('登录已过期，请重新登录')
      localStorage.removeItem('token')
    } else {
      message.error(msg)
    }

    return Promise.reject(error)
  },
)

export function get<T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return request.get<ApiResponse<T>>(url, config).then((res) => res.data)
}

export function post<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return request.post<ApiResponse<T>>(url, data, config).then((res) => res.data)
}

export function put<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return request.put<ApiResponse<T>>(url, data, config).then((res) => res.data)
}

export function del<T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return request.delete<ApiResponse<T>>(url, config).then((res) => res.data)
}

export default request
