import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import { getPersistedToken, clearPersistedAuth } from '@/utils/persistedAuth'

const envBase = import.meta.env.VITE_API_BASE_URL
const defaultBase = 'http://localhost:3002/api/v1'
const baseURL = envBase ? envBase.replace(/\/+$/, '') : defaultBase

const axiosInstance = axios.create({
  baseURL,
  // Don't set default Content-Type - we handle it per request
})

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
    // Set Content-Type only for non-FormData requests
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

      if (isTokenIssue) {
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
}

export const request = async <TResponse, TBody = unknown>(
  options: RequestOptions<TBody>
): Promise<TResponse> => {
  const { url, method = 'GET', data, params, headers, publicApi } = options

  const config: AxiosRequestConfig = {
    url,
    method,
    params,
    headers: { ...headers },
  }

  if (data !== undefined) {
    config.data = data
    // For FormData, don't set Content-Type - let axios set it with boundary
    if (data instanceof FormData) {
      delete config.headers['Content-Type']
    }
  }

  if (publicApi) {
    config.headers = { ...config.headers }
    delete config.headers.Authorization
  }

  const response: AxiosResponse<TResponse> = await axiosInstance(config)
  return response.data
}

const Api = { request }
export default Api
