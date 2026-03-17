import { createAsyncThunk } from '@reduxjs/toolkit'
import AuthService from '../services/authService'
import type { LoginCredentials, RegisterCredentials, LoginResponse, ApiError } from '@/api/types'
import { serializeError } from '@/utils/errorSerializer'

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: ApiError }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await AuthService.login(credentials)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const registerUser = createAsyncThunk<
  LoginResponse,
  RegisterCredentials,
  { rejectValue: ApiError }
>('auth/register', async (credentials, { rejectWithValue }) => {
  try {
    return await AuthService.register(credentials)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const fetchUserProfile = createAsyncThunk<
  LoginResponse,
  void,
  { rejectValue: ApiError }
>('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    return await AuthService.fetchProfile()
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const logoutUser = createAsyncThunk<void, void>('auth/logout', async () => {
  // Clear token on client side; no backend logout endpoint needed
})
