import UserApi from '../api/userApi'
import type { PaginatedUsersResponse } from '../api/types'

class UserService {
  static async listAdminUsers(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedUsersResponse> {
    return UserApi.listAdminUsers(params)
  }

  static async listAppUsers(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedUsersResponse> {
    return UserApi.listAppUsers(params)
  }

  static async createAdminUser(body: { name: string; email: string; password: string; role?: string }) {
    return UserApi.createAdminUser(body)
  }

  static async createAppUser(body: { name: string; email: string; password: string }) {
    return UserApi.createAppUser(body)
  }

  static async updateAdminUserRole(id: string, role: string) {
    return UserApi.updateAdminUserRole(id, role)
  }

  static async toggleAdminUserBan(id: string) {
    return UserApi.toggleAdminUserBan(id)
  }

  static async toggleAppUserBan(id: string) {
    return UserApi.toggleAppUserBan(id)
  }

  static async resetAdminUserPassword(id: string, newPassword: string) {
    return UserApi.resetAdminUserPassword(id, newPassword)
  }

  static async resetAppUserPassword(id: string, newPassword: string) {
    return UserApi.resetAppUserPassword(id, newPassword)
  }

  static async deleteAdminUser(id: string) {
    return UserApi.deleteAdminUser(id)
  }

  static async deleteAppUser(id: string) {
    return UserApi.deleteAppUser(id)
  }

  static async bulkDeleteAdminUsers(ids: string[]) {
    return UserApi.deleteAdminUsers(ids)
  }

  static async bulkDeleteAppUsers(ids: string[]) {
    return UserApi.deleteAppUsers(ids)
  }
}

export default UserService
