import { createAsyncThunk } from '@reduxjs/toolkit'
import UserService from '../services/userService'
import type { ApiError, PaginatedUsersResponse } from '../api/types'
import { serializeError } from '../utils/errorSerializer'

export const fetchAdminUsers = createAsyncThunk<
  PaginatedUsersResponse,
  { page?: number; limit?: number; search?: string },
  { rejectValue: ApiError }
>('users/fetchAdmin', async (params, { rejectWithValue }) => {
  try {
    return await UserService.listAdminUsers(params)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const fetchAppUsers = createAsyncThunk<
  PaginatedUsersResponse,
  { page?: number; limit?: number; search?: string },
  { rejectValue: ApiError }
>('users/fetchApp', async (params, { rejectWithValue }) => {
  try {
    return await UserService.listAppUsers(params)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const createAdminUser = createAsyncThunk<
  void,
  { name: string; email: string; password: string; role?: string },
  { rejectValue: ApiError }
>('users/createAdmin', async (body, { rejectWithValue }) => {
  try {
    await UserService.createAdminUser(body)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const createAppUser = createAsyncThunk<
  void,
  { name: string; email: string; password: string },
  { rejectValue: ApiError }
>('users/createApp', async (body, { rejectWithValue }) => {
  try {
    await UserService.createAppUser(body)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const updateAdminUserRole = createAsyncThunk<
  void,
  { id: string; role: string },
  { rejectValue: ApiError }
>('users/updateAdminRole', async ({ id, role }, { rejectWithValue }) => {
  try {
    await UserService.updateAdminUserRole(id, role)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const toggleAdminUserBan = createAsyncThunk<
  void,
  string,
  { rejectValue: ApiError }
>('users/toggleAdminBan', async (id, { rejectWithValue }) => {
  try {
    await UserService.toggleAdminUserBan(id)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const toggleAppUserBan = createAsyncThunk<
  void,
  string,
  { rejectValue: ApiError }
>('users/toggleAppBan', async (id, { rejectWithValue }) => {
  try {
    await UserService.toggleAppUserBan(id)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const resetAdminUserPassword = createAsyncThunk<
  void,
  { id: string; newPassword: string },
  { rejectValue: ApiError }
>('users/resetAdminPassword', async ({ id, newPassword }, { rejectWithValue }) => {
  try {
    await UserService.resetAdminUserPassword(id, newPassword)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const resetAppUserPassword = createAsyncThunk<
  void,
  { id: string; newPassword: string },
  { rejectValue: ApiError }
>('users/resetAppPassword', async ({ id, newPassword }, { rejectWithValue }) => {
  try {
    await UserService.resetAppUserPassword(id, newPassword)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const deleteAdminUser = createAsyncThunk<
  void,
  string,
  { rejectValue: ApiError }
>('users/deleteAdmin', async (id, { rejectWithValue }) => {
  try {
    await UserService.deleteAdminUser(id)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const deleteAppUser = createAsyncThunk<
  void,
  string,
  { rejectValue: ApiError }
>('users/deleteApp', async (id, { rejectWithValue }) => {
  try {
    await UserService.deleteAppUser(id)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const bulkDeleteAdminUsers = createAsyncThunk<
  void,
  string[],
  { rejectValue: ApiError }
>('users/bulkDeleteAdmin', async (ids, { rejectWithValue }) => {
  try {
    await UserService.bulkDeleteAdminUsers(ids)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const bulkDeleteAppUsers = createAsyncThunk<
  void,
  string[],
  { rejectValue: ApiError }
>('users/bulkDeleteApp', async (ids, { rejectWithValue }) => {
  try {
    await UserService.bulkDeleteAppUsers(ids)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})
