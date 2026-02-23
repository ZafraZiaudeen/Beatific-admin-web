import AuthApi from '../api/authApi'
import type { LoginCredentials, RegisterCredentials, LoginResponse } from '../api/types'

class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return await AuthApi.login(credentials)
  }

  static async register(credentials: RegisterCredentials): Promise<LoginResponse> {
    return await AuthApi.register(credentials)
  }

  static async fetchProfile(): Promise<LoginResponse> {
    return await AuthApi.fetchProfile()
  }
}

export default AuthService
