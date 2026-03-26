import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import type { ApiError } from './types'
import { getPersistedToken, clearPersistedAuth } from '@/utils/persistedAuth'
import { API_BASE_URL } from '@/constants'

const axiosInstance = axios.create({ baseURL: API_BASE_URL })

const activeRequests = new Map<string, Promise<AxiosResponse>>()

export const setAuthToken = (token: string | null): void => {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete axiosInstance.defaults.headers.common.Authorization
  }
}

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getPersistedToken()
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const msg = (error.response?.data?.message || '').toString().toLowerCase()
      const isTokenIssue =
        msg.includes('token') ||
        msg.includes('expired') ||
        msg.includes('invalid') ||
        msg.includes('unauthorized')
      const isPasswordError = msg.includes('correct password') || msg.includes('wrong password')
      if (isTokenIssue && !isPasswordError) {
        clearPersistedAuth()
      }
    }
    return Promise.reject(error)
  }
)

export interface RequestOptions<T = unknown> {
  url: string
  method?: Method
  data?: T
  params?: Record<string, unknown>
  headers?: Record<string, string>
  publicApi?: boolean
  ignoreDuplicateCheck?: boolean
  timeout?: number
}

export const request = async <TResponse, TBody = unknown>(
  options: RequestOptions<TBody>
): Promise<TResponse> => {
  const {
    url,
    method = 'GET',
    data,
    params,
    headers: additionalHeaders,
    publicApi = false,
    ignoreDuplicateCheck = false,
    timeout,
  } = options

  const requestKey = `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`

  if (!ignoreDuplicateCheck && activeRequests.has(requestKey)) {
    const response = await activeRequests.get(requestKey)!
    return response.data
  }

  const config: AxiosRequestConfig = {
    url,
    method,
    params,
    data,
    headers: { ...additionalHeaders },
    ...(timeout ? { timeout } : {}),
  }

  if (data instanceof FormData) {
    delete config.headers!['Content-Type']
  }

  if (publicApi) {
    delete config.headers!['Authorization']
  }

  try {
    const requestPromise = axiosInstance(config)
    if (!ignoreDuplicateCheck) {
      activeRequests.set(requestKey, requestPromise)
    }
    const response = await requestPromise
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      let errorMessage = 'Request failed'
      if (error.response?.data) {
        if (typeof error.response.data === 'object' && error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      const apiError: ApiError = {
        message: errorMessage,
        status: error.response?.status,
      }
      throw apiError
    }
    throw {
      message: 'Network error. Please check your connection.',
      status: 0,
    } as ApiError
  } finally {
    activeRequests.delete(requestKey)
  }
}

export const get = <TResponse>(
  url: string,
  params?: Record<string, unknown>,
  options?: Partial<RequestOptions>
): Promise<TResponse> =>
  request<TResponse>({ url, method: 'GET', params, ...options })

export const post = <TResponse, TBody = unknown>(
  url: string,
  data?: TBody,
  options?: Partial<RequestOptions<TBody>>
): Promise<TResponse> =>
  request<TResponse, TBody>({ url, method: 'POST', data, ...options })

export const put = <TResponse, TBody = unknown>(
  url: string,
  data?: TBody,
  options?: Partial<RequestOptions<TBody>>
): Promise<TResponse> =>
  request<TResponse, TBody>({ url, method: 'PUT', data, ...options })

export const patch = <TResponse, TBody = unknown>(
  url: string,
  data?: TBody,
  options?: Partial<RequestOptions<TBody>>
): Promise<TResponse> =>
  request<TResponse, TBody>({ url, method: 'PATCH', data, ...options })

export const del = <TResponse>(
  url: string,
  options?: Partial<RequestOptions>
): Promise<TResponse> =>
  request<TResponse>({ url, method: 'DELETE', ...options })

const Api = { request, get, post, put, patch, del }
export default Api
