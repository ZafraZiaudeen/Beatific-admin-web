import SettingsApi from '../api/settingsApi'
import type { AppSettings } from '../api/types'

class SettingsService {
  static async get(): Promise<AppSettings> {
    return SettingsApi.get()
  }

  static async updateGeneral(body: {
    appName?: string
    appDescription?: string
    supportEmail?: string
    contactUrl?: string
    maintenanceMode?: boolean
    maintenanceMessage?: string
    allowNewRegistrations?: boolean
  }): Promise<AppSettings> {
    return SettingsApi.updateGeneral(body)
  }

  static async updateSecurity(body: {
    sessionTimeoutHours?: number
    maxLoginAttempts?: number
    requireStrongPassword?: boolean
  }): Promise<AppSettings> {
    return SettingsApi.updateSecurity(body)
  }

  static async updateVerification(body: {
    verificationCodeExpiry?: number
    maxCodeVerifyAttempts?: number
    maxCodeResendAttempts?: number
    codeResendCooldown?: number
    codeSessionResetTime?: number
    maxForgotPasswordAttempts?: number
    forgotPasswordWindowMinutes?: number
  }): Promise<AppSettings> {
    return SettingsApi.updateVerification(body)
  }

  static async updateNotifications(body: {
    enableEmailNotifications?: boolean
    notifyOnNewUser?: boolean
    notifyOnContentPublish?: boolean
    notifyOnLogin?: boolean
  }): Promise<AppSettings> {
    return SettingsApi.updateNotifications(body)
  }

  static async dangerAction(action: 'flush-sessions' | 'ban-all-users' | 'reset') {
    return SettingsApi.dangerAction(action)
  }

  static async testEmail() {
    return SettingsApi.testEmail()
  }

  static async testNotification(type: 'new-user' | 'content-published' | 'admin-login') {
    return SettingsApi.testNotification(type)
  }
}

export default SettingsService
