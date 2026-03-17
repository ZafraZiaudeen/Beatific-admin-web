import Api from './api'
import type { PaginatedUsersResponse, AdminUser } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiData = any

const UserApi = {
  listAdminUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.page)   q.set('page',   String(params.page))
    if (params?.limit)  q.set('limit',  String(params.limit))
    if (params?.search) q.set('search', params.search)
    const qs = q.toString()
    return Api.get<PaginatedUsersResponse>(`/users/admin${qs ? `?${qs}` : ''}`)
  },

  createAdminUser: (body: { name: string; email: string; password: string; role?: string }) =>
    Api.post<ApiData>('/users/admin', body),

  updateAdminUserRole: (id: string, role: string) =>
    Api.patch<ApiData>(`/users/admin/${id}/role`, { role }),

  toggleAdminUserBan: (id: string) =>
    Api.patch<ApiData>(`/users/admin/${id}/ban`),

  resetAdminUserPassword: (id: string, newPassword: string) =>
    Api.patch<ApiData>(`/users/admin/${id}/password`, { newPassword }),

  deleteAdminUser: (id: string) =>
    Api.del<ApiData>(`/users/admin/${id}`),

  deleteAdminUsers: (ids: string[]) =>
    Api.request<ApiData>({ url: '/users/admin/bulk', method: 'DELETE', data: { ids } }),

  // ── App Users ──────────────────────────────────────────────────────────────
  listAppUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.page)   q.set('page',   String(params.page))
    if (params?.limit)  q.set('limit',  String(params.limit))
    if (params?.search) q.set('search', params.search)
    const qs = q.toString()
    return Api.get<PaginatedUsersResponse>(`/users/app${qs ? `?${qs}` : ''}`)
  },

  createAppUser: (body: { name: string; email: string; password: string }) =>
    Api.post<ApiData>('/users/app', body),

  toggleAppUserBan: (id: string) =>
    Api.patch<ApiData>(`/users/app/${id}/ban`),

  resetAppUserPassword: (id: string, newPassword: string) =>
    Api.patch<ApiData>(`/users/app/${id}/password`, { newPassword }),

  deleteAppUser: (id: string) =>
    Api.del<ApiData>(`/users/app/${id}`),

  deleteAppUsers: (ids: string[]) =>
    Api.request<ApiData>({ url: '/users/app/bulk', method: 'DELETE', data: { ids } }),
}

export type { AdminUser }
export default UserApi
