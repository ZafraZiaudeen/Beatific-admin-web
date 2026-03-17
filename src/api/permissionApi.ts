import Api from './api'
import type { PermissionEntry } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiData = any

const PermissionApi = {
  list: (scope?: string) =>
    Api.get<{ data: PermissionEntry[] }>(`/permissions${scope ? `?scope=${scope}` : ''}`),

  get: (scope: string, targetType: string) =>
    Api.get<{ data: PermissionEntry }>(`/permissions/${scope}/${targetType}`),

  upsert: (body: {
    scope: string
    targetType: string
    enabled: boolean
    placementRole?: 'primary' | 'secondary' | null
    allowedCategories?: string[]
    allowedItems?: string[]
  }) => Api.put<ApiData>('/permissions', body),

  bulkUpsert: (permissions: Array<{
    scope: string
    targetType: string
    enabled: boolean
    placementRole?: 'primary' | 'secondary' | null
    allowedCategories?: string[]
    allowedItems?: string[]
  }>) => Api.put<ApiData>('/permissions/bulk', { permissions }),

  delete: (scope: string, targetType: string) =>
    Api.del<ApiData>(`/permissions/${scope}/${targetType}`),
}

export default PermissionApi
