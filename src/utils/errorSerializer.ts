import type { ApiError } from '@/api/types'

export const serializeError = (error: unknown): ApiError => {
  if (
    error &&
    typeof error === 'object' &&
    'isAxiosError' in error &&
    (error as { isAxiosError?: boolean }).isAxiosError
  ) {
    type AxiosErrorLike = {
      message?: string
      response?: { status?: number; data?: { message?: string } }
      isAxiosError?: boolean
    }
    const axiosError = error as AxiosErrorLike
    const serverMessage = axiosError.response?.data?.message
    return {
      message: serverMessage || axiosError.message || 'Network error',
      status: axiosError.response?.status || 500,
    }
  }

  if (error && typeof error === 'object' && 'message' in error && 'status' in error) {
    return error as ApiError
  }
  if (error instanceof Error) {
    return { message: error.message, status: 500 }
  }

  return { message: 'An unknown error occurred', status: 500 }
}
