import Api from './api'
import type { AdminUser } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiData = any

const ProfileApi = {
  updateProfile: (body: { name?: string; email?: string; avatar?: string; bio?: string }) =>
    Api.put<{ data: AdminUser; message: string }>('/auth/profile', body),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    Api.put<{ message: string }>('/auth/change-password', body),

  uploadAvatar: (file: File): Promise<ApiData> => {
    const form = new FormData()
    form.append('file', file)
    return Api.post<ApiData>('/media/upload', form)
  },

  fetchProfile: () =>
    Api.get<{ user: AdminUser; token?: string }>('/auth/me'),
}

export default ProfileApi
