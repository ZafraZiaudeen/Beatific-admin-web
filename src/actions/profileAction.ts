import { createAsyncThunk } from '@reduxjs/toolkit'
import ProfileService from '../services/profileService'
import type { ApiError, AdminUser, UpdateProfilePayload, ChangePasswordPayload } from '../api/types'
import { serializeError } from '../utils/errorSerializer'

export const updateAdminProfile = createAsyncThunk<
  AdminUser,
  UpdateProfilePayload,
  { rejectValue: ApiError }
>('profile/update', async (body, { rejectWithValue }) => {
  try {
    const res = await ProfileService.updateProfile(body)
    return res.data
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const changeAdminPassword = createAsyncThunk<
  string,
  ChangePasswordPayload,
  { rejectValue: ApiError }
>('profile/changePassword', async (body, { rejectWithValue }) => {
  try {
    const res = await ProfileService.changePassword(body)
    return res.message ?? 'Password changed successfully.'
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const uploadAdminAvatar = createAsyncThunk<
  string,
  File,
  { rejectValue: ApiError }
>('profile/uploadAvatar', async (file, { rejectWithValue }) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await ProfileService.uploadAvatar(file)
    const url: string = res?.data?.url ?? res?.url ?? ''
    if (!url) throw new Error('No URL returned from upload')
    return url
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})
