const DEFAULT_API_PORT = '3001'
const DEFAULT_API_PATH = '/api/v1'

function resolveApiBaseUrl(): string {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')
  }

  const port = import.meta.env.VITE_API_PORT || DEFAULT_API_PORT
  const path = import.meta.env.VITE_API_PATH || DEFAULT_API_PATH
  
  return `http://localhost:${port}${path}`
}

export const API_BASE_URL = resolveApiBaseUrl()

export const API_CONFIG = {
  port: import.meta.env.VITE_API_PORT || DEFAULT_API_PORT,
  path: import.meta.env.VITE_API_PATH || DEFAULT_API_PATH,
  baseUrl: API_BASE_URL,
}

export const ADMIN_ROLE_VALUES = ['super_admin', 'admin', 'editor'] as const

export type AdminRole = (typeof ADMIN_ROLE_VALUES)[number]

export const isAdminRole = (value: string): value is AdminRole =>
  ADMIN_ROLE_VALUES.includes(value as AdminRole)
