export interface AdminUser {
  id: string
  _id?: string
  name: string
  email: string
  role: string
}

export interface AuthState {
  user: AdminUser | null
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface LoginResponse {
  user: AdminUser
  token: string
}

export interface ApiError {
  message: string
  status?: number
}
