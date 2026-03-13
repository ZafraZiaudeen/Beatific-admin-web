import React from 'react'

export function apiMsg(err: unknown, fallback = 'An error occurred'): string {
  if (!err || typeof err !== 'object') return fallback
  const e = err as Record<string, unknown>
  const data = (e.response as Record<string, unknown> | undefined)?.data as Record<string, unknown> | undefined
  if (typeof data?.message === 'string') return data.message
  if (typeof e.message === 'string') return e.message
  return fallback
}

export function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full overflow-hidden transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed ${value ? 'bg-indigo-500' : 'bg-stone-300'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${value ? 'left-6' : 'left-1'}`} />
    </button>
  )
}

export function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-800">{label}</p>
        {description && <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0 flex items-center">{children}</div>
    </div>
  )
}

export function SectionCard({ title, description, children, accent }: { title?: string; description?: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {(title || description) && (
        <div className={`px-6 py-4 border-b border-stone-100 ${accent ? `bg-gradient-to-r ${accent}` : ''}`}>
          {title && <h3 className="text-sm font-bold text-stone-900">{title}</h3>}
          {description && <p className="text-xs text-stone-500 mt-0.5">{description}</p>}
        </div>
      )}
      <div className="px-6 divide-y divide-stone-100">{children}</div>
    </div>
  )
}

export function SaveBar({ saving, saved, error, onSave, onReset, isDirty }: {
  saving: boolean; saved: boolean; error: string | null; onSave: () => void; onReset: () => void; isDirty: boolean
}) {
  if (!isDirty && !saved && !error) return null
  return (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm transition-all border ${error ? 'bg-rose-50 border-rose-200' : saved ? 'bg-emerald-50 border-emerald-200' : 'bg-indigo-50 border-indigo-200'}`}>
      {error ? (
        <><span className="text-rose-500">⊗</span><span className="flex-1 text-rose-700">{error}</span></>
      ) : saved ? (
        <><span className="text-emerald-600">✓</span><span className="flex-1 text-emerald-700">Changes saved successfully.</span></>
      ) : (
        <span className="flex-1 text-indigo-700 font-medium">You have unsaved changes.</span>
      )}
      <div className="flex items-center gap-2">
        {isDirty && !saved && (
          <button onClick={onReset} className="px-3 py-1.5 text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
            Discard
          </button>
        )}
        <button
          onClick={onSave}
          disabled={saving || saved || !isDirty}
          className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

export function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Min 6 chars', ok: password.length >= 6 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
    { label: 'Symbol', ok: /[^a-zA-Z0-9]/.test(password) },
  ]
  const passed = checks.filter(c => c.ok).length
  const colors = ['', 'bg-rose-400', 'bg-amber-400', 'bg-sky-400', 'bg-emerald-500']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= passed ? colors[passed] : 'bg-stone-200'}`} />
        ))}
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-xs text-stone-400">Strength: <strong className="text-stone-600">{labels[passed]}</strong></span>
        {checks.map(c => (
          <span key={c.label} className={`text-[10px] flex items-center gap-1 ${c.ok ? 'text-emerald-600' : 'text-stone-400'}`}>
            {c.ok ? '✓' : '○'} {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
export const EyeOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  React.useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  const cls = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-indigo-600'
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-medium ${cls} animate-slide-up`}>
      {type === 'success' ? '✓' : type === 'error' ? '⊗' : 'ℹ'} {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  )
}
