import { useState, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../services/authService'
import eyeIcon from '../assets/eye.svg'
import eyeOffIcon from '../assets/eye-off.svg'

type Step = 'email' | 'verify' | 'reset' | 'done'

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('email')

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMsg, setInfoMsg] = useState<string>('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendsRemaining, setResendsRemaining] = useState(0)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCooldown = (seconds: number) => {
    setResendCooldown(seconds)
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!)
          cooldownRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current) }, [])

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await AuthService.forgotPassword(email.trim().toLowerCase())
      setInfoMsg(res.message)
      setResendsRemaining(res.resendsRemaining)
      startCooldown(res.resendCooldown)
      setStep('verify')
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await AuthService.verifyResetCode(email, code.trim())
      setResetToken(res.resetToken)
      setStep('reset')
    } catch (err: any) {
      setError(err?.message || 'Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || resendsRemaining <= 0) return
    setError(null)
    setLoading(true)
    try {
      const res = await AuthService.resendResetCode(email)
      setInfoMsg(res.message)
      setResendsRemaining(res.resendsRemaining)
      startCooldown(res.resendCooldown)
      setCode('')
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      await AuthService.resetPassword(resetToken, newPassword)
      setStep('done')
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stepTitles: Record<Step, { heading: string; sub: string }> = {
    email:  { heading: 'Forgot password?',   sub: 'Enter your email and we\'ll send you a reset code.' },
    verify: { heading: 'Check your email',    sub: `We've sent a 6-digit code to ${email}` },
    reset:  { heading: 'Create new password', sub: 'Choose a strong password for your account.' },
    done:   { heading: 'Password reset!',     sub: 'Your password has been updated successfully.' },
  }

  const { heading, sub } = stepTitles[step]

  return (
    <div className="w-full h-full bg-white relative flex">
      <div className="hidden lg:flex flex-col overflow-hidden bg-[#F5F2EF] w-1/2 h-full border-r border-stone-200 pt-12 pr-12 pb-12 pl-12 relative justify-between">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white">
              <span className="serif-font italic font-medium">B</span>
            </div>
            <span className="font-semibold tracking-tight text-lg">Beatific Admin</span>
          </div>
          <h1 className="serif-font text-5xl leading-tight text-stone-900 mb-4">
            Reset your<br />password.
          </h1>
          <p className="text-stone-500 max-w-sm text-lg">
            We'll verify your identity with a one-time code sent to your email.
          </p>

          <div className="mt-10 space-y-3">
            {(['email', 'verify', 'reset'] as Step[]).map((s, i) => {
              const stepLabels = ['Enter email', 'Verify code', 'New password']
              const isDone = ['email', 'verify', 'reset', 'done'].indexOf(step) > i
              const isCurrent = step === s || (step === 'done' && s === 'reset')
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                    isDone ? 'bg-stone-900 text-white' : isCurrent ? 'bg-stone-900 text-white ring-4 ring-stone-900/15' : 'bg-stone-200 text-stone-500'
                  }`}>
                    {isDone ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (i + 1)}
                  </div>
                  <span className={`text-sm font-medium ${isCurrent ? 'text-stone-900' : isDone ? 'text-stone-500' : 'text-stone-400'}`}>
                    {stepLabels[i]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-linear-to-t from-stone-100 to-transparent pointer-events-none" />

        <div className="z-10 flex gap-4 text-xs font-medium text-stone-400">
          <span>© 2026 Beatific.</span>
          <a href="#" className="hover:text-stone-900">Privacy</a>
          <a href="#" className="hover:text-stone-900">Terms</a>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900">{heading}</h2>
            <p className="mt-2 text-sm text-stone-500">{sub}</p>
          </div>

          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <form className="space-y-4" onSubmit={handleSendCode}>
              {error && (
                <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                  {error}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-700">Email Address</label>
                <input
                  type="email"
                  placeholder="admin@beatific.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all placeholder:text-stone-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending…
                  </span>
                ) : (
                  <>Send Reset Code <span className="group-hover:translate-x-0.5 transition-transform">→</span></>
                )}
              </button>
            </form>
          )}

          {step === 'verify' && (
            <form className="space-y-4" onSubmit={handleVerifyCode}>
              {infoMsg && (
                <div className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-600">
                  {infoMsg}
                </div>
              )}
              {error && (
                <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                  {error}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-700">Verification Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-center tracking-[0.35em] font-mono focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all placeholder:text-stone-300 placeholder:tracking-widest"
                />
              </div>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verifying…
                  </span>
                ) : (
                  <>Verify Code <span className="group-hover:translate-x-0.5 transition-transform">→</span></>
                )}
              </button>

              <div className="text-center text-xs text-stone-500">
                Didn't receive a code?{' '}
                {resendCooldown > 0 ? (
                  <span className="text-stone-400">Resend in {resendCooldown}s</span>
                ) : resendsRemaining > 0 ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-stone-900 font-semibold hover:underline disabled:opacity-50"
                  >
                    Resend code
                  </button>
                ) : (
                  <span className="text-stone-400">No resends remaining</span>
                )}
              </div>
            </form>
          )}

          {step === 'reset' && (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              {error && (
                <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                  {error}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-700">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pr-10 px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all placeholder:text-stone-400"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded"
                  >
                    <img src={showPassword ? eyeOffIcon : eyeIcon} alt="" className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pr-10 px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all placeholder:text-stone-400"
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirm(s => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded"
                  >
                    <img src={showConfirm ? eyeOffIcon : eyeIcon} alt="" className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Resetting…
                  </span>
                ) : (
                  <>Reset Password <span className="group-hover:translate-x-0.5 transition-transform">→</span></>
                )}
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-200">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-stone-500 text-center">
                  Your password has been reset. You can now sign in with your new password.
                </p>
              </div>
              <button
                onClick={() => navigate('/sign-in')}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2 group"
              >
                Go to Sign In <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            </div>
          )}

          {step !== 'done' && (
            <p className="text-center text-xs text-stone-500">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => navigate('/sign-in')}
                className="text-stone-900 font-semibold hover:underline ml-1"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
