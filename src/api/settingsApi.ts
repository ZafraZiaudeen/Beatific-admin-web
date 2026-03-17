import Api from './api'
import type { AppSettings, SettingsEnvelope, SettingsMessageEnvelope } from './types'

const SettingsApi = {
  get: async (): Promise<AppSettings> => {
    const res = await Api.get<SettingsEnvelope>('/settings')
    return res.data
  },

  updateGeneral: async (body: {
    appName?: string
    appDescription?: string
    supportEmail?: string
    contactUrl?: string
    maintenanceMode?: boolean
    maintenanceMessage?: string
    allowNewRegistrations?: boolean
  }): Promise<AppSettings> => {
    const res = await Api.put<SettingsEnvelope, typeof body>('/settings/general', body)
    return res.data
  },

  updateSecurity: async (body: {
    sessionTimeoutHours?: number
    maxLoginAttempts?: number
    requireStrongPassword?: boolean
  }): Promise<AppSettings> => {
    const res = await Api.put<SettingsEnvelope, typeof body>('/settings/security', body)
    return res.data
  },

  updateVerification: async (body: {
    verificationCodeExpiry?: number
    maxCodeVerifyAttempts?: number
    maxCodeResendAttempts?: number
    codeResendCooldown?: number
    codeSessionResetTime?: number
    maxForgotPasswordAttempts?: number
    forgotPasswordWindowMinutes?: number
  }): Promise<AppSettings> => {
    const res = await Api.put<SettingsEnvelope, typeof body>('/settings/verification', body)
    return res.data
  },

  updateNotifications: async (body: {
    enableEmailNotifications?: boolean
    notifyOnNewUser?: boolean
    notifyOnContentPublish?: boolean
    notifyOnLogin?: boolean
  }): Promise<AppSettings> => {
    const res = await Api.put<SettingsEnvelope, typeof body>('/settings/notifications', body)
    return res.data
  },

  dangerAction: async (action: 'flush-sessions' | 'ban-all-users' | 'reset'): Promise<SettingsMessageEnvelope> => {
    return Api.post<SettingsMessageEnvelope>(`/settings/${action}`)
  },

  testEmail: async (): Promise<SettingsMessageEnvelope> => {
    return Api.post<SettingsMessageEnvelope>('/settings/test-email')
  },

  testNotification: async (type: 'new-user' | 'content-published' | 'admin-login'): Promise<SettingsMessageEnvelope> => {
    return Api.post<SettingsMessageEnvelope, { type: string }>('/settings/test-notification', { type })
  },
}

export default SettingsApi
