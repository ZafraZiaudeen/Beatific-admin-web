export const DEFAULT_API_BASE_URL = 'http://localhost:3002/api/v1'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')
    : DEFAULT_API_BASE_URL
)

export const ADMIN_ROLE_VALUES = ['super_admin', 'admin', 'editor'] as const

export type AdminRole = (typeof ADMIN_ROLE_VALUES)[number]

export const isAdminRole = (value: string): value is AdminRole =>
  ADMIN_ROLE_VALUES.includes(value as AdminRole)