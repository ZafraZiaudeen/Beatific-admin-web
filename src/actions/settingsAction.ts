import { createAsyncThunk } from '@reduxjs/toolkit'
import SettingsService from '../services/settingsService'
import type { ApiError, AppSettings } from '../api/types'
import { serializeError } from '../utils/errorSerializer'

export const fetchSettings = createAsyncThunk<
  AppSettings,
  void,
  { rejectValue: ApiError }
>('settings/fetch', async (_, { rejectWithValue }) => {
  try {
    return await SettingsService.get()
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const updateGeneralSettings = createAsyncThunk<
  AppSettings,
  {
    appName?: string
    appDescription?: string
    supportEmail?: string
    contactUrl?: string
    maintenanceMode?: boolean
    maintenanceMessage?: string
    allowNewRegistrations?: boolean
  },
  { rejectValue: ApiError }
>('settings/updateGeneral', async (body, { rejectWithValue }) => {
  try {
    return await SettingsService.updateGeneral(body)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const updateSecuritySettings = createAsyncThunk<
  AppSettings,
  {
    sessionTimeoutHours?: number
    maxLoginAttempts?: number
    requireStrongPassword?: boolean
  },
  { rejectValue: ApiError }
>('settings/updateSecurity', async (body, { rejectWithValue }) => {
  try {
    return await SettingsService.updateSecurity(body)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const updateVerificationSettings = createAsyncThunk<
  AppSettings,
  {
    verificationCodeExpiry?: number
    maxCodeVerifyAttempts?: number
    maxCodeResendAttempts?: number
    codeResendCooldown?: number
    codeSessionResetTime?: number
    maxForgotPasswordAttempts?: number
    forgotPasswordWindowMinutes?: number
  },
  { rejectValue: ApiError }
>('settings/updateVerification', async (body, { rejectWithValue }) => {
  try {
    return await SettingsService.updateVerification(body)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const updateNotificationSettings = createAsyncThunk<
  AppSettings,
  {
    enableEmailNotifications?: boolean
    notifyOnNewUser?: boolean
    notifyOnContentPublish?: boolean
    notifyOnLogin?: boolean
  },
  { rejectValue: ApiError }
>('settings/updateNotifications', async (body, { rejectWithValue }) => {
  try {
    return await SettingsService.updateNotifications(body)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const executeDangerAction = createAsyncThunk<
  string,
  'flush-sessions' | 'ban-all-users' | 'reset',
  { rejectValue: ApiError }
>('settings/dangerAction', async (action, { rejectWithValue }) => {
  try {
    const res = await SettingsService.dangerAction(action)
    return res.message ?? 'Action completed.'
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const sendTestEmail = createAsyncThunk<
  string,
  void,
  { rejectValue: ApiError }
>('settings/testEmail', async (_, { rejectWithValue }) => {
  try {
    const res = await SettingsService.testEmail()
    return res.message ?? 'Test email sent.'
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const sendTestNotification = createAsyncThunk<
  string,
  'new-user' | 'content-published' | 'admin-login',
  { rejectValue: ApiError }
>('settings/testNotification', async (type, { rejectWithValue }) => {
  try {
    const res = await SettingsService.testNotification(type)
    return res.message ?? 'Test notification sent.'
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})
