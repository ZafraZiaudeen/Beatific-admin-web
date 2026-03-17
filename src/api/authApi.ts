import Api from './api'
import type { LoginCredentials, RegisterCredentials, LoginResponse } from './types'
import { isAdminRole } from '@/constants'

interface BackendAuthResponse {
  success: boolean
  _id: string
  name: string
  email: string
  role: string
  token: string
  bio?: string
  avatar?: string
}

interface BackendProfileResponse {
  success: boolean
  _id: string
  name: string
  email: string
  role: string
  bio?: string
  avatar?: string
}

const toAdminRole = (role: string) => (isAdminRole(role) ? role : 'editor')

export interface ForgotPasswordResponse {
  message: string
  expiresIn: number
  resendCooldown: number
  resendsRemaining: number
}

export interface VerifyResetCodeResponse {
  message: string
  resetToken: string
}

export interface ResetPasswordResponse {
  message: string
}

const AuthApi = {
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await Api.request<{ success: boolean; data: ForgotPasswordResponse }>({
      url: '/auth/forgot-password',
      method: 'POST',
      data: { email },
      publicApi: true,
    })
    return response.data
  },

  verifyResetCode: async (email: string, code: string): Promise<VerifyResetCodeResponse> => {
    const response = await Api.request<{ success: boolean; data: VerifyResetCodeResponse }>({
      url: '/auth/verify-reset-code',
      method: 'POST',
      data: { email, code },
      publicApi: true,
    })
    return response.data
  },

  resetPassword: async (resetToken: string, newPassword: string): Promise<ResetPasswordResponse> => {
    const response = await Api.request<{ success: boolean; data: ResetPasswordResponse }>({
      url: '/auth/reset-password',
      method: 'POST',
      data: { resetToken, newPassword },
      publicApi: true,
    })
    return response.data
  },

  resendResetCode: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await Api.request<{ success: boolean; data: ForgotPasswordResponse }>({
      url: '/auth/resend-reset-code',
      method: 'POST',
      data: { email },
      publicApi: true,
    })
    return response.data
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await Api.request<BackendAuthResponse, LoginCredentials>({
      url: '/auth/login',
      method: 'POST',
      data: credentials,
      publicApi: true,
    })

    return {
      user: {
        id: response._id,
        _id: response._id,
        name: response.name,
        email: response.email,
        role: toAdminRole(response.role),
        bio: response.bio,
        avatar: response.avatar,
      },
      token: response.token,
    }
  },

  register: async (credentials: RegisterCredentials): Promise<LoginResponse> => {
    const response = await Api.request<BackendAuthResponse, RegisterCredentials>({
      url: '/auth/register',
      method: 'POST',
      data: credentials,
      publicApi: true,
    })

    return {
      user: {
        id: response._id,
        _id: response._id,
        name: response.name,
        email: response.email,
        role: toAdminRole(response.role),
        bio: response.bio,
        avatar: response.avatar,
      },
      token: response.token,
    }
  },

  fetchProfile: async (): Promise<LoginResponse> => {
    const response = await Api.request<BackendProfileResponse>({
      url: '/auth/me',
      method: 'GET',
    })

    return {
      user: {
        id: response._id,
        _id: response._id,
        name: response.name,
        email: response.email,
        role: toAdminRole(response.role),
        bio: response.bio,
        avatar: response.avatar,
      },
      token: '',
    }
  },
}

export default AuthApi
