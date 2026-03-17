import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../api/hooks'
import { fetchUserProfile } from '../actions/authAction'
import {
  fetchSettings, updateGeneralSettings, updateSecuritySettings,
  updateVerificationSettings, updateNotificationSettings,
  executeDangerAction, sendTestEmail, sendTestNotification
} from '../actions/settingsAction'
import {
  updateAdminProfile, changeAdminPassword, uploadAdminAvatar
} from '../actions/profileAction'
import { setToast, clearToast } from '../slices/uiSlice'
import {
  apiMsg, Toggle, SettingRow, SectionCard, SaveBar,
  PasswordStrength, EyeIcon, EyeOffIcon, Toast,
} from '../components/SettingsShared'

// ─── Types ────────────────────────────────────────────────
interface AppSettings {
  appName: string; appDescription: string; supportEmail: string; contactUrl: string
  maintenanceMode: boolean; maintenanceMessage: string; allowNewRegistrations: boolean
  sessionTimeoutHours: number; maxLoginAttempts: number; requireStrongPassword: boolean
  enableEmailNotifications: boolean; notifyOnNewUser: boolean; notifyOnContentPublish: boolean; notifyOnLogin: boolean
  verificationCodeExpiry: number; maxCodeVerifyAttempts: number; maxCodeResendAttempts: number
  codeResendCooldown: number; codeSessionResetTime: number
  maxForgotPasswordAttempts: number; forgotPasswordWindowMinutes: number
}
type Tab = 'profile' | 'general' | 'security' | 'verification' | 'notifications' | 'danger'
interface ToastState { msg: string; type: 'success' | 'error' | 'info' | 'warning' }

// ─── ProfileTab ───────────────────────────────────────────
function ProfileTab({ user }: { user: { name: string; email: string; role: string; avatar?: string; bio?: string } | null }) {
  const dispatch = useAppDispatch()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName]     = useState(user?.name ?? '')
  const [email, setEmail]   = useState(user?.email ?? '')
  const [bio, setBio]       = useState(user?.bio ?? '')
  const [avatar, setAvatar] = useState(user?.avatar ?? '')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [profSaving, setProfSaving] = useState(false)
  const [profSaved, setProfSaved]   = useState(false)
  const [profError, setProfError]   = useState<string | null>(null)

  const [currentPw, setCurrentPw] = useState(''); const [newPw, setNewPw] = useState(''); const [confirmPw, setConfirmPw] = useState('')
  const [pwSaving, setPwSaving]   = useState(false); const [pwSaved, setPwSaved] = useState(false); const [pwError, setPwError] = useState<string | null>(null)
  const [showCur, setShowCur]     = useState(false); const [showNew, setShowNew] = useState(false)

  const profDirty = name !== (user?.name ?? '') || email !== (user?.email ?? '') || bio !== (user?.bio ?? '') || avatar !== (user?.avatar ?? '')

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingAvatar(true)
    try {
      const res = await dispatch(uploadAdminAvatar(file)).unwrap()
      const url: string = typeof res === 'string' ? res : (res as any)?.url ?? ''
      if (url) { setAvatar(url); setProfSaved(false) }
    } catch (err) { setProfError(apiMsg(err, 'Failed to upload image')) }
    finally { setUploadingAvatar(false) }
  }

  const handleSaveProfile = async () => {
    setProfSaving(true); setProfError(null)
    try {
      await dispatch(updateAdminProfile({ name: name.trim(), email: email.trim(), bio: bio.trim(), avatar })).unwrap()
      setProfSaved(true); setTimeout(() => setProfSaved(false), 3000)
      void dispatch(fetchUserProfile())
    } catch (err) { setProfError(apiMsg(err, 'Failed to update profile')) }
    finally { setProfSaving(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return }
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters'); return }
    setPwSaving(true); setPwError(null)
    try {
      await dispatch(changeAdminPassword({ currentPassword: currentPw, newPassword: newPw })).unwrap()
      setPwSaved(true); setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => setPwSaved(false), 3000)
    } catch (err) { setPwError(apiMsg(err, 'Failed to change password')) }
    finally { setPwSaving(false) }
  }

  const initials = (user?.name ?? 'A').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6">
      {/* Avatar + Identity */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 px-6 py-4 border-b border-stone-100">
          <h3 className="text-sm font-bold text-stone-900">Profile Information</h3>
          <p className="text-xs text-stone-500 mt-0.5">Your public identity across the admin panel.</p>
        </div>
        <div className="p-6">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-indigo-100 shadow-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                {avatar
                  ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  : <span className="text-white text-2xl font-bold">{initials}</span>
                }
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar
                  ? <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-stone-900">{user?.name ?? '—'}</p>
              <p className="text-sm text-stone-400">{user?.email ?? '—'}</p>
              <span className="inline-flex mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200 capitalize">
                {user?.role?.replace('_', ' ') ?? 'admin'}
              </span>
              <p className="text-xs text-stone-400 mt-2">Click avatar to upload a new profile photo</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Full Name</label>
              <input value={name} onChange={e => { setName(e.target.value); setProfSaved(false); setProfError(null) }}
                placeholder="Your full name"
                className="w-full text-sm px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setProfSaved(false); setProfError(null) }}
                placeholder="your@email.com"
                className="w-full text-sm px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Bio <span className="text-stone-300 font-normal">(optional)</span></label>
            <textarea value={bio} onChange={e => { setBio(e.target.value); setProfSaved(false); setProfError(null) }}
              rows={2} maxLength={300} placeholder="A short description about yourself…"
              className="w-full text-sm px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none" />
            <p className="text-xs text-stone-300 text-right">{bio.length}/300</p>
          </div>
          <SaveBar saving={profSaving} saved={profSaved} error={profError}
            onSave={handleSaveProfile}
            onReset={() => { setName(user?.name ?? ''); setEmail(user?.email ?? ''); setBio(user?.bio ?? ''); setAvatar(user?.avatar ?? ''); setProfError(null) }}
            isDirty={profDirty} />
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-stone-50 to-slate-50 px-6 py-4 border-b border-stone-100">
          <h3 className="text-sm font-bold text-stone-900">Change Password</h3>
          <p className="text-xs text-stone-500 mt-0.5">Keep your account secure with a strong password.</p>
        </div>
        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
          {pwError && <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700"><span>⊗</span>{pwError}</div>}
          {pwSaved && <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700"><span>✓</span>Password changed successfully.</div>}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Current Password</label>
            <div className="relative">
              <input type={showCur ? 'text' : 'password'} value={currentPw}
                onChange={e => { setCurrentPw(e.target.value); setPwError(null) }}
                required placeholder="Enter current password"
                className="w-full text-sm px-3 py-2.5 pr-10 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
              <button type="button" onClick={() => setShowCur(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">{showCur ? <EyeOffIcon /> : <EyeIcon />}</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={newPw}
                  onChange={e => { setNewPw(e.target.value); setPwError(null) }}
                  required minLength={6} placeholder="Min. 6 characters"
                  className="w-full text-sm px-3 py-2.5 pr-10 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">{showNew ? <EyeOffIcon /> : <EyeIcon />}</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Confirm New Password</label>
              <input type="password" value={confirmPw}
                onChange={e => { setConfirmPw(e.target.value); setPwError(null) }}
                required placeholder="Repeat new password"
                className={`w-full text-sm px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${confirmPw && confirmPw !== newPw ? 'border-rose-300 focus:border-rose-400' : 'border-stone-200 focus:border-indigo-400'}`} />
            </div>
          </div>
          {newPw && <PasswordStrength password={newPw} />}
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={pwSaving || !currentPw || !newPw || !confirmPw}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors">
              {pwSaving ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── GeneralTab ───────────────────────────────────────────
function GeneralTab({ settings, onRefresh }: { settings: AppSettings | null; onRefresh: () => void }) {
  const dispatch = useAppDispatch()
  const [appName, setAppName]           = useState(settings?.appName ?? '')
  const [appDesc, setAppDesc]           = useState(settings?.appDescription ?? '')
  const [supportEmail, setSupportEmail] = useState(settings?.supportEmail ?? '')
  const [contactUrl, setContactUrl]     = useState(settings?.contactUrl ?? '')
  const [maintenance, setMaintenance]   = useState(settings?.maintenanceMode ?? false)
  const [maintMsg, setMaintMsg]         = useState(settings?.maintenanceMessage ?? '')
  const [allowReg, setAllowReg]         = useState(settings?.allowNewRegistrations ?? true)
  const [saving, setSaving]             = useState(false); const [saved, setSaved] = useState(false); const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!settings) return
    setAppName(settings.appName); setAppDesc(settings.appDescription)
    setSupportEmail(settings.supportEmail); setContactUrl(settings.contactUrl)
    setMaintenance(settings.maintenanceMode); setMaintMsg(settings.maintenanceMessage)
    setAllowReg(settings.allowNewRegistrations)
  }, [settings])

  const isDirty = appName !== (settings?.appName ?? '') || appDesc !== (settings?.appDescription ?? '') ||
    supportEmail !== (settings?.supportEmail ?? '') || contactUrl !== (settings?.contactUrl ?? '') ||
    maintenance !== (settings?.maintenanceMode ?? false) || maintMsg !== (settings?.maintenanceMessage ?? '') ||
    allowReg !== (settings?.allowNewRegistrations ?? true)

  const reset = () => {
    if (!settings) return
    setAppName(settings.appName); setAppDesc(settings.appDescription)
    setSupportEmail(settings.supportEmail); setContactUrl(settings.contactUrl)
    setMaintenance(settings.maintenanceMode); setMaintMsg(settings.maintenanceMessage)
    setAllowReg(settings.allowNewRegistrations); setError(null)
  }
  const mark = () => setSaved(false)
  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      await dispatch(updateGeneralSettings({ appName, appDescription: appDesc, supportEmail, contactUrl, maintenanceMode: maintenance, maintenanceMessage: maintMsg, allowNewRegistrations: allowReg })).unwrap()
      setSaved(true); setTimeout(() => setSaved(false), 3000); onRefresh()
    } catch (err) { setError(apiMsg(err)) } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <SectionCard title="App Identity" description="Core branding and contact information for your platform." accent="from-indigo-50/50 to-transparent">
        <div className="py-4">
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">App Name</label>
          <input value={appName} onChange={e => { setAppName(e.target.value); mark() }} placeholder="Beatific Admin"
            className="w-full text-sm px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
          <p className="text-xs text-stone-400 mt-1.5">Shown in the browser tab and sidebar header.</p>
        </div>
        <div className="py-4">
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">Description</label>
          <textarea value={appDesc} onChange={e => { setAppDesc(e.target.value); mark() }} rows={2}
            placeholder="Content management panel for the Beatific app."
            className="w-full text-sm px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Support Email</label>
            <input type="email" value={supportEmail} onChange={e => { setSupportEmail(e.target.value); mark() }} placeholder="support@yourapp.com"
              className="w-full text-sm px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Contact URL</label>
            <input value={contactUrl} onChange={e => { setContactUrl(e.target.value); mark() }} placeholder="https://yourapp.com/contact"
              className="w-full text-sm px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="App Behaviour" description="Control access and availability for all users.">
        <SettingRow label="Allow New Registrations" description="When disabled, new users cannot sign up to the app.">
          <Toggle value={allowReg} onChange={v => { setAllowReg(v); mark() }} />
        </SettingRow>
        <SettingRow label="Maintenance Mode" description="Temporarily take the app offline for all users while performing updates.">
          <Toggle value={maintenance} onChange={v => { setMaintenance(v); mark() }} />
        </SettingRow>
        {maintenance && (
          <div className="pb-4">
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Maintenance Message</label>
            <textarea value={maintMsg} onChange={e => { setMaintMsg(e.target.value); mark() }} rows={2}
              placeholder="We are currently down for maintenance. Please check back shortly."
              className="w-full text-sm px-3 py-2.5 border border-amber-200 bg-amber-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all resize-none" />
            <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1.5">⚠ Maintenance mode is <strong>ON</strong> — users cannot access the app.</p>
          </div>
        )}
      </SectionCard>

      <SaveBar saving={saving} saved={saved} error={error} onSave={handleSave} onReset={reset} isDirty={isDirty} />
    </div>
  )
}

// ─── SecurityTab ──────────────────────────────────────────
function SecurityTab({ settings, onRefresh }: { settings: AppSettings | null; onRefresh: () => void }) {
  const dispatch = useAppDispatch()
  const [sessionHours, setSessionHours] = useState(settings?.sessionTimeoutHours ?? 168)
  const [maxAttempts, setMaxAttempts]   = useState(settings?.maxLoginAttempts ?? 10)
  const [strongPw, setStrongPw]         = useState(settings?.requireStrongPassword ?? false)
  const [saving, setSaving]             = useState(false); const [saved, setSaved] = useState(false); const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!settings) return
    setSessionHours(settings.sessionTimeoutHours); setMaxAttempts(settings.maxLoginAttempts); setStrongPw(settings.requireStrongPassword)
  }, [settings])

  const isDirty = sessionHours !== (settings?.sessionTimeoutHours ?? 168) || maxAttempts !== (settings?.maxLoginAttempts ?? 10) || strongPw !== (settings?.requireStrongPassword ?? false)
  const reset = () => { if (!settings) return; setSessionHours(settings.sessionTimeoutHours); setMaxAttempts(settings.maxLoginAttempts); setStrongPw(settings.requireStrongPassword); setError(null) }
  const mark = () => setSaved(false)
  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      await dispatch(updateSecuritySettings({ sessionTimeoutHours: sessionHours, maxLoginAttempts: maxAttempts, requireStrongPassword: strongPw })).unwrap()
      setSaved(true); setTimeout(() => setSaved(false), 3000); onRefresh()
    } catch (err) { setError(apiMsg(err)) } finally { setSaving(false) }
  }

  const sessionDays = (sessionHours / 24).toFixed(1).replace('.0', '')

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 px-5 py-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600 shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <div>
          <p className="text-sm font-semibold text-indigo-800">Security Settings</p>
          <p className="text-xs text-indigo-600 mt-0.5">Changes to security policies take effect immediately for all new sessions.</p>
        </div>
      </div>

      <SectionCard title="Session Policy" description="Configure how long admin sessions remain active.">
        <SettingRow label="Session Timeout" description={`Currently ${sessionHours}h ≈ ${sessionDays} day${sessionDays === '1' ? '' : 's'}. Sessions expire after this duration.`}>
          <div className="flex items-center gap-2">
            <input type="number" min={1} max={8760} value={sessionHours}
              onChange={e => { setSessionHours(Number(e.target.value)); mark() }}
              className="w-20 text-sm px-3 py-2 border border-stone-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
            <span className="text-sm text-stone-500">hours</span>
          </div>
        </SettingRow>
        <div className="py-3 flex flex-wrap gap-2">
          {[24, 72, 168, 720].map(h => (
            <button key={h} onClick={() => { setSessionHours(h); mark() }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${sessionHours === h ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-indigo-300'}`}>
              {h === 24 ? '1 day' : h === 72 ? '3 days' : h === 168 ? '1 week' : '30 days'}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Admin Login Security" description="Configure admin login attempt limits and password policies. These apply to admin panel logins only.">
        <SettingRow label="Max Admin Login Attempts" description="Temporarily lock admin accounts after this many consecutive failed login attempts.">
          <div className="flex items-center gap-2">
            <input type="number" min={3} max={100} value={maxAttempts}
              onChange={e => { setMaxAttempts(Number(e.target.value)); mark() }}
              className="w-20 text-sm px-3 py-2 border border-stone-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
            <span className="text-sm text-stone-500">attempts</span>
          </div>
        </SettingRow>
        <SettingRow label="Require Strong Passwords" description="Enforce uppercase letters, numbers, and special characters for all admin passwords.">
          <Toggle value={strongPw} onChange={v => { setStrongPw(v); mark() }} />
        </SettingRow>
      </SectionCard>

      <SaveBar saving={saving} saved={saved} error={error} onSave={handleSave} onReset={reset} isDirty={isDirty} />
    </div>
  )
}

// ─── VerificationTab ──────────────────────────────────────
function VerificationTab({ settings, onRefresh }: { settings: AppSettings | null; onRefresh: () => void }) {
  const dispatch = useAppDispatch()
  const [codeExpiry, setCodeExpiry]         = useState(settings?.verificationCodeExpiry ?? 10)
  const [maxVerify, setMaxVerify]           = useState(settings?.maxCodeVerifyAttempts ?? 5)
  const [maxResend, setMaxResend]           = useState(settings?.maxCodeResendAttempts ?? 3)
  const [cooldown, setCooldown]             = useState(settings?.codeResendCooldown ?? 60)
  const [sessionReset, setSessionReset]     = useState(settings?.codeSessionResetTime ?? 30)
  const [maxForgot, setMaxForgot]           = useState(settings?.maxForgotPasswordAttempts ?? 3)
  const [forgotWindow, setForgotWindow]     = useState(settings?.forgotPasswordWindowMinutes ?? 30)
  const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false); const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!settings) return
    setCodeExpiry(settings.verificationCodeExpiry); setMaxVerify(settings.maxCodeVerifyAttempts)
    setMaxResend(settings.maxCodeResendAttempts); setCooldown(settings.codeResendCooldown)
    setSessionReset(settings.codeSessionResetTime); setMaxForgot(settings.maxForgotPasswordAttempts)
    setForgotWindow(settings.forgotPasswordWindowMinutes)
  }, [settings])

  const isDirty = codeExpiry !== (settings?.verificationCodeExpiry ?? 10) ||
    maxVerify !== (settings?.maxCodeVerifyAttempts ?? 5) || maxResend !== (settings?.maxCodeResendAttempts ?? 3) ||
    cooldown !== (settings?.codeResendCooldown ?? 60) || sessionReset !== (settings?.codeSessionResetTime ?? 30) ||
    maxForgot !== (settings?.maxForgotPasswordAttempts ?? 3) || forgotWindow !== (settings?.forgotPasswordWindowMinutes ?? 30)

  const reset = () => {
    if (!settings) return
    setCodeExpiry(settings.verificationCodeExpiry); setMaxVerify(settings.maxCodeVerifyAttempts)
    setMaxResend(settings.maxCodeResendAttempts); setCooldown(settings.codeResendCooldown)
    setSessionReset(settings.codeSessionResetTime); setMaxForgot(settings.maxForgotPasswordAttempts)
    setForgotWindow(settings.forgotPasswordWindowMinutes); setError(null)
  }
  const mark = () => setSaved(false)

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      await dispatch(updateVerificationSettings({
        verificationCodeExpiry: codeExpiry,
        maxCodeVerifyAttempts: maxVerify,
        maxCodeResendAttempts: maxResend,
        codeResendCooldown: cooldown,
        codeSessionResetTime: sessionReset,
        maxForgotPasswordAttempts: maxForgot,
        forgotPasswordWindowMinutes: forgotWindow,
      })).unwrap()
      setSaved(true); setTimeout(() => setSaved(false), 3000); onRefresh()
    } catch (err) { setError(apiMsg(err)) } finally { setSaving(false) }
  }

  const numInput = (value: number, onChange: (v: number) => void, min: number, max: number, unit: string) => (
    <div className="flex items-center gap-2">
      <input type="number" min={min} max={max} value={value}
        onChange={e => { onChange(Number(e.target.value)); mark() }}
        className="w-20 text-sm px-3 py-2 border border-stone-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
      <span className="text-sm text-stone-500">{unit}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 px-5 py-4 bg-violet-50 border border-violet-200 rounded-2xl">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600 shrink-0 mt-0.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <div>
          <p className="text-sm font-semibold text-violet-800">Verification & Rate Limiting</p>
          <p className="text-xs text-violet-600 mt-0.5">Control how verification codes work for app users — registration email verification and forgot password flows.</p>
        </div>
      </div>

      <SectionCard title="Verification Code Settings" description="How long codes remain valid and how many times users can attempt verification." accent="from-violet-50/50 to-transparent">
        <SettingRow label="Code Expiry Time" description="How long a verification code remains valid after being sent.">
          {numInput(codeExpiry, setCodeExpiry, 1, 60, 'minutes')}
        </SettingRow>
        <SettingRow label="Max Verify Attempts" description="How many times a user can enter a wrong code before it's invalidated.">
          {numInput(maxVerify, setMaxVerify, 1, 20, 'attempts')}
        </SettingRow>
      </SectionCard>

      <SectionCard title="Resend Controls" description="Rate-limit how often users can request new verification codes.">
        <SettingRow label="Max Resend Attempts" description="Maximum number of times a code can be resent within a session.">
          {numInput(maxResend, setMaxResend, 1, 20, 'resends')}
        </SettingRow>
        <SettingRow label="Resend Cooldown" description="Minimum time between consecutive resend requests.">
          {numInput(cooldown, setCooldown, 10, 600, 'seconds')}
        </SettingRow>
        <SettingRow label="Session Reset Time" description="After max resend attempts are exhausted, how long before a new session begins.">
          {numInput(sessionReset, setSessionReset, 5, 1440, 'minutes')}
        </SettingRow>
      </SectionCard>

      <SectionCard title="Forgot Password Protection" description="Prevent abuse of the forgot password flow.">
        <SettingRow label="Max Forgot Password Requests" description="Maximum number of password reset requests per email within the time window.">
          {numInput(maxForgot, setMaxForgot, 1, 20, 'requests')}
        </SettingRow>
        <SettingRow label="Rate Limit Window" description="The rolling time window for counting forgot password requests.">
          {numInput(forgotWindow, setForgotWindow, 5, 1440, 'minutes')}
        </SettingRow>
      </SectionCard>

      {/* Quick Presets */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="text-sm font-bold text-stone-900">Quick Presets</h3>
          <p className="text-xs text-stone-500 mt-0.5">Apply predefined configurations for common use cases.</p>
        </div>
        <div className="px-6 py-4 flex flex-wrap gap-2">
          <button onClick={() => {
            setCodeExpiry(10); setMaxVerify(5); setMaxResend(3); setCooldown(60); setSessionReset(30); setMaxForgot(3); setForgotWindow(30); mark()
          }} className="px-4 py-2 text-xs font-semibold rounded-xl border bg-stone-50 text-stone-700 border-stone-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
            🔒 Default (Balanced)
          </button>
          <button onClick={() => {
            setCodeExpiry(5); setMaxVerify(3); setMaxResend(2); setCooldown(120); setSessionReset(60); setMaxForgot(2); setForgotWindow(60); mark()
          }} className="px-4 py-2 text-xs font-semibold rounded-xl border bg-stone-50 text-stone-700 border-stone-200 hover:border-rose-300 hover:bg-rose-50 transition-all">
            🛡️ Strict (High Security)
          </button>
          <button onClick={() => {
            setCodeExpiry(15); setMaxVerify(8); setMaxResend(5); setCooldown(30); setSessionReset(15); setMaxForgot(5); setForgotWindow(15); mark()
          }} className="px-4 py-2 text-xs font-semibold rounded-xl border bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all">
            🌿 Relaxed (User-Friendly)
          </button>
        </div>
      </div>

      <SaveBar saving={saving} saved={saved} error={error} onSave={handleSave} onReset={reset} isDirty={isDirty} />
    </div>
  )
}

// ─── NotificationsTab ─────────────────────────────────────
function NotificationsTab({ settings, onRefresh }: { settings: AppSettings | null; onRefresh: () => void }) {
  const dispatch = useAppDispatch()
  const [emailEnabled, setEmailEnabled] = useState(settings?.enableEmailNotifications ?? false)
  const [onNewUser, setOnNewUser]       = useState(settings?.notifyOnNewUser ?? true)
  const [onPublish, setOnPublish]       = useState(settings?.notifyOnContentPublish ?? false)
  const [onLogin, setOnLogin]           = useState(settings?.notifyOnLogin ?? false)
  const [saving, setSaving]             = useState(false); const [saved, setSaved] = useState(false); const [error, setError] = useState<string | null>(null)
  const [testingTrigger, setTestingTrigger] = useState<string | null>(null)

  useEffect(() => {
    if (!settings) return
    setEmailEnabled(settings.enableEmailNotifications); setOnNewUser(settings.notifyOnNewUser)
    setOnPublish(settings.notifyOnContentPublish); setOnLogin(settings.notifyOnLogin)
  }, [settings])

  const isDirty = emailEnabled !== (settings?.enableEmailNotifications ?? false) || onNewUser !== (settings?.notifyOnNewUser ?? true) ||
    onPublish !== (settings?.notifyOnContentPublish ?? false) || onLogin !== (settings?.notifyOnLogin ?? false)
  const reset = () => { if (!settings) return; setEmailEnabled(settings.enableEmailNotifications); setOnNewUser(settings.notifyOnNewUser); setOnPublish(settings.notifyOnContentPublish); setOnLogin(settings.notifyOnLogin); setError(null) }
  const mark = () => setSaved(false)
  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      await dispatch(updateNotificationSettings({ enableEmailNotifications: emailEnabled, notifyOnNewUser: onNewUser, notifyOnContentPublish: onPublish, notifyOnLogin: onLogin })).unwrap()
      setSaved(true); setTimeout(() => setSaved(false), 3000); onRefresh()
    } catch (err) { setError(apiMsg(err)) } finally { setSaving(false) }
  }

  const handleTestTrigger = async (type: 'new-user' | 'content-published' | 'admin-login') => {
    setTestingTrigger(type); setError(null)
    try {
      await dispatch(sendTestNotification(type)).unwrap()
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(apiMsg(err, 'Failed to send test notification'))
    } finally {
      setTestingTrigger(null)
    }
  }

  const handleTestEmail = async () => {
    setSaving(true); setError(null)
    try {
      await dispatch(sendTestEmail()).unwrap()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      // Reuse the saved state UI; error state covers failures
      
    } catch (err) {
      setError(apiMsg(err, 'Failed to send test email'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Email Notifications" description="Master control for all email alerts sent from the admin panel." accent="from-violet-50/50 to-transparent">
        <SettingRow label="Enable Email Notifications" description="Global toggle — must be on for any notification to be sent.">
          <Toggle value={emailEnabled} onChange={v => { setEmailEnabled(v); mark() }} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Notification Triggers" description="Choose exactly which events fire an email notification.">
        <SettingRow label="New User Registered" description="Notify when a new user creates an account on the app.">
          <div className="flex items-center gap-2">
            {emailEnabled && onNewUser && (
              <button onClick={() => handleTestTrigger('new-user')} disabled={testingTrigger !== null} className="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 disabled:opacity-40 transition-colors">
                {testingTrigger === 'new-user' ? 'Sending…' : 'Test'}
              </button>
            )}
            <Toggle value={onNewUser} onChange={v => { setOnNewUser(v); mark() }} disabled={!emailEnabled} />
          </div>
        </SettingRow>
        <SettingRow label="Content Published" description="Notify when a new piece of content is published via the CMS.">
          <div className="flex items-center gap-2">
            {emailEnabled && onPublish && (
              <button onClick={() => handleTestTrigger('content-published')} disabled={testingTrigger !== null} className="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 disabled:opacity-40 transition-colors">
                {testingTrigger === 'content-published' ? 'Sending…' : 'Test'}
              </button>
            )}
            <Toggle value={onPublish} onChange={v => { setOnPublish(v); mark() }} disabled={!emailEnabled} />
          </div>
        </SettingRow>
        <SettingRow label="Admin Login" description="Notify when any admin account logs into the panel.">
          <div className="flex items-center gap-2">
            {emailEnabled && onLogin && (
              <button onClick={() => handleTestTrigger('admin-login')} disabled={testingTrigger !== null} className="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 disabled:opacity-40 transition-colors">
                {testingTrigger === 'admin-login' ? 'Sending…' : 'Test'}
              </button>
            )}
            <Toggle value={onLogin} onChange={v => { setOnLogin(v); mark() }} disabled={!emailEnabled} />
          </div>
        </SettingRow>
      </SectionCard>

      {!emailEnabled && (
        <div className="flex items-center gap-2.5 px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-500">
          ℹ Enable email notifications above to configure individual triggers.
        </div>
      )}

      <div className="flex items-center justify-between gap-3 px-5 py-4 bg-white border border-stone-200 rounded-2xl shadow-sm">
        <div>
          <p className="text-sm font-semibold text-stone-800">Test email</p>
          <p className="text-xs text-stone-500 mt-0.5">Sends a test email to the “Support Email” configured in General settings.</p>
        </div>
        <button
          onClick={handleTestEmail}
          disabled={saving}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          {saving ? 'Sending…' : 'Send Test Email'}
        </button>
      </div>

      <SaveBar saving={saving} saved={saved} error={error} onSave={handleSave} onReset={reset} isDirty={isDirty} />
    </div>
  )
}

// ─── DangerZoneTab ────────────────────────────────────────
function DangerZoneTab({ onToast }: { onToast: (t: ToastState) => void }) {
  const dispatch = useAppDispatch()
  const [confirmText, setConfirmText] = useState('')
  const [showConfirm, setShowConfirm] = useState<string | null>(null)
  const [acting, setActing]           = useState(false)

  const actions = [
    {
      id: 'flush-sessions', label: 'Flush All Admin Sessions',
      description: 'Immediately invalidate all active admin sessions. All admins will need to sign in again.',
      button: 'Flush Sessions', confirm: 'flush sessions', color: 'amber',
    },
    {
      id: 'ban-all-users', label: 'Ban All App Users',
      description: 'Temporarily ban every app user. Useful during a security incident. Can be reversed manually via the Users page.',
      button: 'Ban All Users', confirm: 'ban all users', color: 'rose',
    },
    {
      id: 'reset', label: 'Reset Settings to Defaults',
      description: 'Reset all platform settings to factory defaults. Your profile and content remain untouched.',
      button: 'Reset Settings', confirm: 'reset settings', color: 'rose',
    },
  ]

  const cm = {
    amber: { card: 'border-amber-200 bg-amber-50/30', btn: 'bg-amber-500 hover:bg-amber-600 text-white', badge: 'bg-amber-100 text-amber-700', input: 'focus:ring-amber-400' },
    rose:  { card: 'border-rose-200 bg-rose-50/30',   btn: 'bg-rose-600 hover:bg-rose-700 text-white',   badge: 'bg-rose-100 text-rose-700',   input: 'focus:ring-rose-400' },
  } as Record<string, { card: string; btn: string; badge: string; input: string }>

  const handleConfirm = async (id: string) => {
    setActing(true)
    try {
      const res = await dispatch(executeDangerAction(id as 'flush-sessions' | 'ban-all-users' | 'reset')).unwrap()
      onToast({ msg: (res as any)?.message ?? 'Action completed.', type: 'success' })
    } catch (err) {
      onToast({ msg: apiMsg(err, 'Action failed'), type: 'error' })
    } finally {
      setActing(false); setShowConfirm(null); setConfirmText('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 px-5 py-4 bg-rose-50 border border-rose-200 rounded-2xl mb-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-600 shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <div>
          <p className="text-sm font-bold text-rose-800">Danger Zone</p>
          <p className="text-xs text-rose-600 mt-0.5">These actions have immediate, system-wide impact. Each requires explicit confirmation before proceeding.</p>
        </div>
      </div>

      {actions.map(action => {
        const c = cm[action.color]
        return (
          <div key={action.id} className={`rounded-2xl border p-5 ${c.card}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-bold text-stone-900 mb-1">{action.label}</p>
                <p className="text-xs text-stone-500 leading-relaxed">{action.description}</p>
              </div>
              <button onClick={() => { setShowConfirm(action.id); setConfirmText('') }}
                disabled={showConfirm !== null}
                className={`shrink-0 px-4 py-2 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${c.btn}`}>
                {action.button}
              </button>
            </div>
            {showConfirm === action.id && (
              <div className="mt-4 pt-4 border-t border-current/10">
                <p className="text-xs text-stone-600 mb-2">
                  Type <span className="font-mono font-bold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded">{action.confirm}</span> to confirm:
                </p>
                <div className="flex items-center gap-2">
                  <input value={confirmText} onChange={e => setConfirmText(e.target.value)}
                    placeholder={action.confirm}
                    className={`flex-1 text-sm px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 ${c.input} bg-white`} />
                  <button onClick={() => handleConfirm(action.id)}
                    disabled={confirmText !== action.confirm || acting}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl disabled:opacity-40 transition-colors ${c.btn}`}>
                    {acting ? '…' : 'Confirm'}
                  </button>
                  <button onClick={() => { setShowConfirm(null); setConfirmText('') }}
                    className="px-3 py-2 text-sm font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Nav Items ────────────────────────────────────────────
const NAV: { id: Tab; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'profile',       label: 'My Profile',    desc: 'Avatar, name & password',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { id: 'general',       label: 'General',       desc: 'App identity & behaviour',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  { id: 'security',      label: 'Security',      desc: 'Sessions & login policy',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { id: 'verification',  label: 'Verification',  desc: 'Code limits & rate control',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
  { id: 'notifications', label: 'Notifications', desc: 'Email alert triggers',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { id: 'danger',        label: 'Danger Zone',   desc: 'Irreversible system actions',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
]

// ─── Main Page ────────────────────────────────────────────
export default function SettingsPage() {
  const user       = useAppSelector(s => s.auth.user)
  const toast      = useAppSelector(s => s.ui.toast)
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const { data: settings, loading, error: loadError } = useAppSelector(s => s.settings)
  const dispatch = useAppDispatch()
  

  const loadSettings = useCallback(async () => {
    await dispatch(fetchSettings())
  }, [dispatch])

  useEffect(() => { void loadSettings() }, [loadSettings])

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50 min-h-0">
      <div className="max-w-screen-xl mx-auto p-6">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </div>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Settings</h1>
            </div>
            <p className="text-sm text-stone-500 ml-9">Manage your profile, app configuration, and system preferences.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-200 rounded-xl shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-stone-600">All systems operational</span>
          </div>
        </div>

        {loadError && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
            ⊗ {loadError}
          </div>
        )}

        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <aside className="w-60 shrink-0 sticky top-6 space-y-3">
            <nav className="bg-white rounded-2xl border border-stone-200 shadow-sm p-2 space-y-0.5">
              {NAV.map(item => {
                const active   = activeTab === item.id
                const isDanger = item.id === 'danger'
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                      active
                        ? isDanger ? 'bg-rose-50 text-rose-700' : 'bg-indigo-50 text-indigo-700'
                        : isDanger ? 'text-rose-400 hover:bg-rose-50 hover:text-rose-600' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                    }`}>
                    <span className={`mt-0.5 shrink-0 ${active ? (isDanger ? 'text-rose-600' : 'text-indigo-600') : isDanger ? 'text-rose-400' : 'text-stone-400'}`}>
                      {item.icon}
                    </span>
                    <span>
                      <span className="block text-xs font-semibold leading-tight">{item.label}</span>
                      <span className="block text-[10px] mt-0.5 opacity-60 leading-tight">{item.desc}</span>
                    </span>
                  </button>
                )
              })}
            </nav>

            {/* System Info */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">System</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">Version</span>
                  <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">v1.0.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">Role</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 capitalize">
                    {user?.role?.replace('_', ' ') ?? 'admin'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">Backend</span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Online
                  </span>
                </div>
                {settings?.maintenanceMode && (
                  <div className="mt-1 px-2.5 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-[10px] font-bold text-amber-700">⚠ Maintenance ON</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-24 text-stone-400 gap-3">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span className="text-sm">Loading settings…</span>
              </div>
            ) : (
              <>
                {activeTab === 'profile'       && <ProfileTab user={user as any} />}
                {activeTab === 'general'       && <GeneralTab settings={settings} onRefresh={loadSettings} />}
                {activeTab === 'security'      && <SecurityTab settings={settings} onRefresh={loadSettings} />}
                {activeTab === 'verification'  && <VerificationTab settings={settings} onRefresh={loadSettings} />}
                {activeTab === 'notifications' && <NotificationsTab settings={settings} onRefresh={loadSettings} />}
                {activeTab === 'danger'        && <DangerZoneTab onToast={(t) => dispatch(setToast(t))} />}
              </>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type === 'warning' ? 'info' : toast.type} onClose={() => dispatch(clearToast())} />}
    </div>
  )
}
