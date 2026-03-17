import AuthApi from '../api/authApi'
import type { ForgotPasswordResponse, VerifyResetCodeResponse, ResetPasswordResponse } from '../api/authApi'
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

  static async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return await AuthApi.forgotPassword(email)
  }

  static async verifyResetCode(email: string, code: string): Promise<VerifyResetCodeResponse> {
    return await AuthApi.verifyResetCode(email, code)
  }

  static async resetPassword(resetToken: string, newPassword: string): Promise<ResetPasswordResponse> {
    return await AuthApi.resetPassword(resetToken, newPassword)
  }

  static async resendResetCode(email: string): Promise<ForgotPasswordResponse> {
    return await AuthApi.resendResetCode(email)
  }
}

export default AuthService
