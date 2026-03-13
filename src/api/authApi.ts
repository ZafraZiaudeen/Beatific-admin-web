import Api from './api'
import type { LoginCredentials, RegisterCredentials, LoginResponse } from './types'

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

const AuthApi = {
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
        role: response.role,
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
        role: response.role,
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
        role: response.role,
        bio: response.bio,
        avatar: response.avatar,
      },
      token: '',
    }
  },
}

export default AuthApi
