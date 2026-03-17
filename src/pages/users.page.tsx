import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { useAppDispatch, useAppSelector } from '../api/hooks'
import {
  fetchAdminUsers, fetchAppUsers, createAdminUser, createAppUser,
  updateAdminUserRole, toggleAdminUserBan, toggleAppUserBan,
  deleteAdminUser, deleteAppUser, bulkDeleteAdminUsers, bulkDeleteAppUsers
} from '../actions/userAction'
import { clearUserErrors } from '../slices/usersSlice'
import type { AdminUser, AppUser } from '../api/types'

function apiMsg(err: unknown, fallback = 'An error occurred'): string {
  if (!err || typeof err !== 'object') return fallback
  const e = err as Record<string, unknown>
  const resp = e.response as Record<string, unknown> | undefined
  const data = resp?.data as Record<string, unknown> | undefined
  if (typeof data?.message === 'string') return data.message
  if (typeof e.message === 'string') return e.message
  return fallback
}


type Tab = 'admin' | 'app'

function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
function fmtRelative(d?: string) {
  if (!d) return '—'
  const diff = Date.now() - new Date(d).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  const months = Math.floor(days / 30)
  if (mins < 2)    return '1 minute ago'
  if (mins < 60)   return `${mins} minutes ago`
  if (hours < 24)  return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  if (days < 30)   return `${days} day${days !== 1 ? 's' : ''} ago`
  return `${months} month${months !== 1 ? 's' : ''} ago`
}

const ROLE_META: Record<string, { label: string; cls: string }> = {
  super_admin: { label: 'Super Admin', cls: 'bg-violet-100 text-violet-700 border-violet-200' },
  admin:       { label: 'Admin',       cls: 'bg-sky-100 text-sky-700 border-sky-200' },
  editor:      { label: 'Editor',      cls: 'bg-amber-100 text-amber-700 border-amber-200' },
}
function RoleBadge({ role }: { role: string }) {
  const m = ROLE_META[role] ?? { label: role, cls: 'bg-stone-100 text-stone-600 border-stone-200' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${m.cls}`}>
      {m.label}
    </span>
  )
}

function StatusBadge({ banned }: { banned: boolean }) {
  return banned ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500 text-white">
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      Banned
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-white">
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      Active
    </span>
  )
}

function resolveUserId(user: AdminUser | AppUser): string | null {
  return user._id ?? ('id' in user && typeof user.id === 'string' ? user.id : null)
}

function Avatar({ name, src, size = 8 }: { name: string; src?: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  const sizeClass = `w-${size} h-${size}`
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover shrink-0 ring-2 ring-white`}
        onError={() => setFailed(true)}
      />
    )
  }
  const initials = name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-teal-500']
  const colorIdx = name.charCodeAt(0) % colors.length
  return (
    <div className={`${sizeClass} rounded-full shrink-0 ring-2 ring-white flex items-center justify-center text-white text-xs font-bold ${colors[colorIdx]}`}>
      {initials}
    </div>
  )
}

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)
const ExportIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
)
const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M6 9l6 6 6-6"/>
  </svg>
)
const ChevronLeftIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
const ChevronRightIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
const ChevronsLeftIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
const ChevronsRightIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
)
const ShieldOffIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18"/>
    <path d="M4.73 4.73A9.33 9.33 0 0 0 4 7v5c0 5.25 7 8 8 8a7.06 7.06 0 0 0 3-.75"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
)
const SortIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-40">
    <path d="M7 15l5 5 5-5M7 9l5-5 5 5"/>
  </svg>
)

interface DropdownProps {
  label: string
  icon?: React.ReactNode
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}
function FilterDropdown({ label, icon, options, value, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-white border rounded-full hover:border-stone-300 hover:bg-stone-50 transition-all shadow-sm ${value ? 'text-stone-800 border-stone-400' : 'text-stone-600 border-stone-200'}`}
      >
        {icon && <span className="text-stone-400">{icon}</span>}
        <span>{selected?.label ?? label}</span>
        <ChevronDownIcon />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-30 bg-white border border-stone-200 rounded-xl shadow-lg py-1.5 min-w-40">
          {options.map(o => (
            <button
              key={o.value}
              className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${value === o.value ? 'bg-stone-900 text-white font-semibold' : 'text-stone-700 hover:bg-stone-50'}`}
              onClick={() => { onChange(o.value); setOpen(false) }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface AddUserModalProps {
  tab: Tab
  onClose: () => void
  onCreated: () => void
}

function AddUserModal({ tab, onClose, onCreated }: AddUserModalProps) {
  const dispatch = useAppDispatch()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState<string>('admin')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (tab === 'admin') {
        await dispatch(createAdminUser({ name, email, password, role })).unwrap()
      } else {
        await dispatch(createAppUser({ name, email, password })).unwrap()
      }
      onCreated()
    } catch (err: unknown) {
      setError(apiMsg(err, 'Failed to create user'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-base font-bold text-stone-900">Add {tab === 'admin' ? 'Admin User' : 'App User'}</h2>
            <p className="text-xs text-stone-400 mt-0.5">Fill in the details to create a new user</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors">
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Full Name</label>
            <input
              required value={name} onChange={e => setName(e.target.value)}
              className="w-full text-sm px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Email Address</label>
            <input
              required type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full text-sm px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Password</label>
            <input
              required type="password" value={password} onChange={e => setPassword(e.target.value)}
              minLength={6}
              className="w-full text-sm px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all"
              placeholder="Min. 6 characters"
            />
          </div>
          {tab === 'admin' && (
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Role</label>
              <select
                value={role} onChange={e => setRole(e.target.value)}
                className="w-full text-sm px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all bg-white appearance-none"
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface EditUserModalProps {
  user: AdminUser | AppUser
  tab: Tab
  isSuperAdmin: boolean
  onClose: () => void
  onUpdated: () => void
}

function EditUserModal({ user, tab, isSuperAdmin, onClose, onUpdated }: EditUserModalProps) {
  const dispatch = useAppDispatch()
  const isAdmin   = tab === 'admin'
  const adminUser = isAdmin ? (user as AdminUser) : null
  const [role, setRole]       = useState(adminUser?.role ?? 'editor')
  const [banned, setBanned]   = useState(user.isBanned)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const hasChanges = (isAdmin && role !== adminUser?.role) || banned !== user.isBanned

  const handleSave = async () => {
    if (!hasChanges) return
    const userId = resolveUserId(user)
    if (!userId) {
      setError('Missing user id')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (isAdmin && role !== adminUser?.role) {
        await dispatch(updateAdminUserRole({ id: userId, role })).unwrap()
      }
      if (banned !== user.isBanned) {
        if (isAdmin) {
          await dispatch(toggleAdminUserBan(userId)).unwrap()
        } else {
          await dispatch(toggleAppUserBan(userId)).unwrap()
        }
      }
      setSuccess(true)
      setTimeout(() => { onUpdated() }, 800)
    } catch (err: unknown) {
      setError(apiMsg(err, 'Failed to update user'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} src={(user as AppUser).avatar} size={10} />
            <div>
              <h2 className="text-sm font-bold text-stone-900">{user.name}</h2>
              <p className="text-xs text-stone-400">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Changes saved successfully
            </div>
          )}

          {isAdmin && isSuperAdmin && (
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-2">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['editor', 'admin', 'super_admin'] as const).map(r => {
                  const m = ROLE_META[r]
                  const isActive = role === r
                  return (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        isActive ? 'bg-stone-900 text-white border-stone-900' : `${m.cls} hover:opacity-80`
                      }`}
                    >
                      {m.label}
                    </button>
                  )
                })}
              </div>
              {adminUser && ['admin', 'super_admin'].includes(adminUser.role) && role === 'editor' && (
                <p className="mt-2 text-xs text-amber-600 flex items-center gap-1.5">
                  <ShieldOffIcon />
                  This will remove admin access from this user
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-2">Account Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setBanned(false)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                  !banned
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Active
              </button>
              <button
                onClick={() => setBanned(true)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                  banned
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                Banned
              </button>
            </div>
            {banned && (
              <p className="mt-2 text-xs text-rose-500">
                This user will be blocked from accessing the platform.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges || success}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-700 disabled:opacity-40 transition-colors"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface DeleteModalProps {
  userId: string
  userName: string
  tab: Tab
  onClose: () => void
  onDeleted: () => void
}

function DeleteModal({ userId, userName, tab, onClose, onDeleted }: DeleteModalProps) {
  const dispatch = useAppDispatch()
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    try {
      if (tab === 'admin') {
        await dispatch(deleteAdminUser(userId)).unwrap()
      } else {
        await dispatch(deleteAppUser(userId)).unwrap()
      }
      onDeleted()
    } catch (err: unknown) {
      setError(apiMsg(err, 'Failed to delete user'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <TrashIcon />
            </div>
            <div>
              <p className="font-bold text-stone-900">Delete User</p>
              <p className="text-sm text-stone-400 mt-0.5">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-sm text-stone-600 bg-stone-50 rounded-xl px-3 py-3">
            You are about to permanently delete{' '}
            <span className="font-semibold text-stone-900">{userName}</span>.
            All their data will be removed.
          </p>
          {error && (
            <div className="px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">{error}</div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleDelete} disabled={deleting}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-colors"
            >
              {deleting ? 'Deleting…' : 'Delete User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Rows per page selector ─────────────────────────────── */
const PER_PAGE_OPTIONS = [10, 20, 50]

function RowsPerPage({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2 text-sm text-stone-500">
      <span>Rows per page</span>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="appearance-none pl-3 pr-7 py-1.5 text-sm text-stone-700 font-medium bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 cursor-pointer"
        >
          {PER_PAGE_OPTIONS.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-400">
          <ChevronDownIcon />
        </span>
      </div>
    </div>
  )
}

function Pagination({
  page, pages, total, limit, onPage,
}: {
  page: number; pages: number; total: number; limit: number; onPage: (p: number) => void
}) {
  const from = total === 0 ? 0 : Math.min((page - 1) * limit + 1, total)
  const to   = Math.min(page * limit, total)

  const getPageNumbers = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_: unknown, i: number) => i + 1)
    const arr: (number | '...')[] = [1]
    if (page > 3) arr.push('...')
    for (let p = Math.max(2, page - 1); p <= Math.min(pages - 1, page + 1); p++) arr.push(p)
    if (page < pages - 2) arr.push('...')
    arr.push(pages)
    return arr
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-stone-500">
        {total === 0 ? '0 rows' : `${from}–${to} of ${total} rows`}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(1)} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-stone-100 disabled:opacity-30 text-stone-500 transition-colors" title="First page">
          <ChevronsLeftIcon />
        </button>
        <button onClick={() => onPage(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-stone-100 disabled:opacity-30 text-stone-500 transition-colors">
          <ChevronLeftIcon />
        </button>
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className="w-8 h-8 flex items-center justify-center text-stone-400 text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`w-8 h-8 text-sm font-semibold rounded-lg transition-colors ${p === page ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              {p}
            </button>
          )
        )}
        <button onClick={() => onPage(page + 1)} disabled={page === pages} className="p-1.5 rounded-lg hover:bg-stone-100 disabled:opacity-30 text-stone-500 transition-colors">
          <ChevronRightIcon />
        </button>
        <button onClick={() => onPage(pages)} disabled={page === pages} className="p-1.5 rounded-lg hover:bg-stone-100 disabled:opacity-30 text-stone-500 transition-colors" title="Last page">
          <ChevronsRightIcon />
        </button>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const currentUser  = useAppSelector(s => s.auth.user)
  const isSuperAdmin = currentUser?.role === 'super_admin'

  const [tab, setTab]                   = useState<Tab>('admin')
  const { adminUsers, appUsers, adminTotal, appTotal, adminPages, appPages, loading, error } = useAppSelector(s => s.users)
  const dispatch = useAppDispatch()
  const [adminPage, setAdminPage]       = useState(1)
  const [appPage, setAppPage]           = useState(1)
  const [limit, setLimit]               = useState(10)
  const [search, setSearch]             = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set())

  const [showAdd, setShowAdd]             = useState(false)
  const [editUser, setEditUser]           = useState<AdminUser | AppUser | null>(null)
  const [confirmDel, setConfirmDel]       = useState<{ id: string; name: string } | null>(null)
  const [confirmBulkDel, setConfirmBulkDel] = useState(false)
  const [bulkDeleting, setBulkDeleting]   = useState(false)

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearch = (val: string) => {
    setSearch(val)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => { setDebouncedSearch(val); setAdminPage(1); setAppPage(1) }, 350)
  }

  const doFetchAdminUsers = useCallback(() => {
    dispatch(fetchAdminUsers({ page: adminPage, limit, search: debouncedSearch }))
  }, [dispatch, adminPage, limit, debouncedSearch])

  const doFetchAppUsers = useCallback(() => {
    dispatch(fetchAppUsers({ page: appPage, limit, search: debouncedSearch }))
  }, [dispatch, appPage, limit, debouncedSearch])

  useEffect(() => {
    setSelectedIds(new Set())
    if (tab === 'admin') doFetchAdminUsers()
    else doFetchAppUsers()
  }, [tab, doFetchAdminUsers, doFetchAppUsers])

  /* ── Client-side filtering ── */
  const filteredAdminUsers = adminUsers.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false
    if (statusFilter === 'active' && u.isBanned) return false
    if (statusFilter === 'banned' && !u.isBanned) return false
    return true
  })
  const filteredAppUsers = appUsers.filter(u => {
    if (statusFilter === 'active' && u.isBanned) return false
    if (statusFilter === 'banned' && !u.isBanned) return false
    return true
  })

  const currentUsers = tab === 'admin' ? filteredAdminUsers : filteredAppUsers
  const currentTotal = tab === 'admin' ? adminTotal : appTotal
  const currentPage  = tab === 'admin' ? adminPage : appPage
  const currentPages = tab === 'admin' ? adminPages : appPages

  /* ── Checkbox helpers ── */
  const allSelected = currentUsers.length > 0 && currentUsers.every((u) => {
    const id = resolveUserId(u)
    return id ? selectedIds.has(id) : false
  })
  const someSelected = currentUsers.some((u) => {
    const id = resolveUserId(u)
    return id ? selectedIds.has(id) : false
  }) && !allSelected
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(prev => {
        const n = new Set(prev)
        currentUsers.forEach((u) => {
          const id = resolveUserId(u)
          if (id) n.delete(id)
        })
        return n
      })
    } else {
      setSelectedIds(prev => {
        const n = new Set(prev)
        currentUsers.forEach((u) => {
          const id = resolveUserId(u)
          if (id) n.add(id)
        })
        return n
      })
    }
  }
  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  /* ── Export ── */
  const handleExport = () => {
    const users = tab === 'admin' ? adminUsers : appUsers
    const rows = users.map(u => ({
      Name:           u.name,
      Email:          u.email,
      Role:           tab === 'admin' ? (u as AdminUser).role.replace('_', ' ') : 'app_user',
      Status:         u.isBanned ? 'Banned' : 'Active',
      Joined:         fmtDate(u.createdAt),
      'Last Updated': fmtDate(u.updatedAt ?? u.createdAt),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, tab === 'admin' ? 'Admin Users' : 'App Users')
    XLSX.writeFile(wb, `beatific-${tab}-users-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const handlePageChange = (p: number) => {
    if (tab === 'admin') setAdminPage(p)
    else setAppPage(p)
  }

  const handleLimitChange = (n: number) => {
    setLimit(n)
    setAdminPage(1)
    setAppPage(1)
  }

  const resetFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setRoleFilter('')
    setStatusFilter('')
    setAdminPage(1)
    setAppPage(1)
  }

  const hasFilters = !!(search || roleFilter || statusFilter)

  const handleBulkDelete = async () => {
    setBulkDeleting(true)
    dispatch(clearUserErrors())
    try {
      const ids = [...selectedIds]
      if (tab === 'admin') {
        await dispatch(bulkDeleteAdminUsers(ids)).unwrap()
        doFetchAdminUsers()
      } else {
        await dispatch(bulkDeleteAppUsers(ids)).unwrap()
        doFetchAppUsers()
      }
      setSelectedIds(new Set())
      setConfirmBulkDel(false)
    } catch (err: unknown) {
      
      console.error(err)
    } finally {
      setBulkDeleting(false)
    }
  }

  const activeCnt = currentUsers.filter(u => !u.isBanned).length
  const bannedCnt = currentUsers.filter(u => u.isBanned).length

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50 min-h-0">
      <div className="max-w-screen-2xl mx-auto p-6 space-y-6">

        {/* ── Page Header ── */}
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">User Management</h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage all users in one place. Control access, assign roles, and monitor activity across your platform.
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl w-fit">
          {(['admin', 'app'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => {
                setTab(t)
                setSearch('')
                setDebouncedSearch('')
                setRoleFilter('')
                setStatusFilter('')
              }}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                tab === t ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {t === 'admin' ? 'Admin Users' : 'App Users'}
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                tab === t ? 'bg-stone-100 text-stone-600' : 'bg-stone-200/70 text-stone-500'
              }`}>
                {t === 'admin' ? adminTotal : appTotal}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"><SearchIcon /></span>
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 bg-white shadow-sm transition-all"
            />
          </div>

          {tab === 'admin' && (
            <FilterDropdown
              label="Role"
              icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              }
              options={[
                { value: '', label: 'All Roles' },
                { value: 'super_admin', label: 'Super Admin' },
                { value: 'admin', label: 'Admin' },
                { value: 'editor', label: 'Editor' },
              ]}
              value={roleFilter}
              onChange={v => { setRoleFilter(v); setAdminPage(1) }}
            />
          )}

          <FilterDropdown
            label="Status"
            icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
            }
            options={[
              { value: '', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'banned', label: 'Banned' },
            ]}
            value={statusFilter}
            onChange={v => { setStatusFilter(v); setAdminPage(1); setAppPage(1) }}
          />

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors"
            >
              <CloseIcon />
              Clear
            </button>
          )}

          <div className="flex-1" />

          <button
            onClick={handleExport}
            disabled={currentUsers.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-600 bg-white border border-stone-200 rounded-full hover:border-stone-300 hover:bg-stone-50 disabled:opacity-40 transition-all shadow-sm"
          >
            <ExportIcon />
            Export
          </button>

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-stone-900 rounded-full hover:bg-stone-700 transition-colors shadow-sm"
          >
            <PlusIcon />
            Add User
          </button>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span className="flex-1">{error}</span>
            <button onClick={() => dispatch(clearUserErrors())} className="text-rose-400 hover:text-rose-700 transition-colors"><CloseIcon /></button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-stone-900 text-white text-sm">
              <span className="font-semibold">{selectedIds.size} selected</span>
              <button
                onClick={() => setConfirmBulkDel(true)}
                disabled={bulkDeleting}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-xs font-semibold transition-colors"
              >
                <TrashIcon />
                Delete selected
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-stone-400 hover:text-white transition-colors text-xs">
                Clear selection
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-stone-400 gap-3">
              <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span className="text-sm">Loading users…</span>
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-stone-400 gap-3">
              <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-stone-600">No users found</p>
                <p className="text-xs text-stone-400 mt-1">
                  {hasFilters ? 'Try adjusting your filters' : `No ${tab} users yet`}
                </p>
              </div>
              {hasFilters && (
                <button onClick={resetFilters} className="text-xs font-semibold text-stone-900 underline underline-offset-2">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-160">
                <thead>
                  <tr className="bg-stone-900 border-b border-stone-800">
                    <th className="w-11 px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={el => { if (el) el.indeterminate = someSelected }}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded bg-stone-700 border-stone-600 accent-white cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-stone-300 uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-1.5">Full Name <SortIcon /></div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-stone-300 uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-1.5">Email <SortIcon /></div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-stone-300 uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-1.5">Status <SortIcon /></div>
                    </th>
                    {tab === 'admin' && (
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-stone-300 uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-1.5">Role <SortIcon /></div>
                      </th>
                    )}
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-stone-300 uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-1.5">Joined Date <SortIcon /></div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-stone-300 uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-1.5">Last Active <SortIcon /></div>
                    </th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-stone-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {currentUsers.map(user => {
                    const userId = resolveUserId(user)
                    const rowKey = userId ?? `${user.email}-${user.name}`
                    const isSelected = userId ? selectedIds.has(userId) : false
                    return (
                      <tr
                        key={rowKey}
                        className={`group transition-colors ${isSelected ? 'bg-stone-50' : 'hover:bg-stone-50/60'}`}
                      >
                        <td className="w-11 px-4 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => { if (userId) toggleOne(userId) }}
                            disabled={!userId}
                            className="w-4 h-4 rounded accent-stone-900 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar name={user.name} src={(user as AppUser).avatar} />
                            <span className="text-sm font-semibold text-stone-800 truncate">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-stone-500">{user.email}</span>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge banned={!!user.isBanned} />
                        </td>
                        {tab === 'admin' && (
                          <td className="px-4 py-4">
                            <RoleBadge role={(user as AdminUser).role} />
                          </td>
                        )}
                        <td className="px-4 py-4">
                          <span className="text-sm text-stone-500">{fmtDate(user.createdAt)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-stone-500">{fmtRelative(user.lastActiveAt)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditUser(user)}
                              title="Edit user"
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => { if (userId) setConfirmDel({ id: userId, name: user.name }) }}
                              title="Delete user"
                              disabled={!userId}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table footer */}
          {!loading && currentUsers.length > 0 && (
            <div className="border-t border-stone-100">
              <div className="flex items-center gap-4 px-4 py-2.5 bg-stone-50/60 text-xs text-stone-400">
                <span className="font-medium text-stone-600">{currentTotal} total</span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {activeCnt} active
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {bannedCnt} banned
                </span>
                {tab === 'admin' && (
                  <>
                    <span>·</span>
                    <span>{filteredAdminUsers.filter(u => u.role === 'super_admin').length} super admin</span>
                    <span>·</span>
                    <span>{filteredAdminUsers.filter(u => u.role === 'admin').length} admin</span>
                    <span>·</span>
                    <span>{filteredAdminUsers.filter(u => u.role === 'editor').length} editor</span>
                  </>
                )}
                <div className="flex-1" />
                <RowsPerPage value={limit} onChange={handleLimitChange} />
              </div>
              <Pagination
                page={currentPage}
                pages={currentPages}
                total={currentTotal}
                limit={limit}
                onPage={handlePageChange}
              />
            </div>
          )}
        </div>

      </div>

      {/* ── Modals ── */}
      {showAdd && (
        <AddUserModal
          tab={tab}
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false)
            if (tab === 'admin') doFetchAdminUsers()
            else doFetchAppUsers()
          }}
        />
      )}
      {editUser && (
        <EditUserModal
          user={editUser}
          tab={tab}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setEditUser(null)}
          onUpdated={() => {
            setEditUser(null)
            if (tab === 'admin') doFetchAdminUsers()
            else doFetchAppUsers()
          }}
        />
      )}
      {confirmDel && (
        <DeleteModal
          userId={confirmDel.id}
          userName={confirmDel.name}
          tab={tab}
          onClose={() => setConfirmDel(null)}
          onDeleted={() => {
            setConfirmDel(null)
            if (tab === 'admin') doFetchAdminUsers()
            else doFetchAppUsers()
          }}
        />
      )}
      {confirmBulkDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setConfirmBulkDel(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <TrashIcon />
                </div>
                <div>
                  <p className="font-bold text-stone-900">Delete {selectedIds.size} Users</p>
                  <p className="text-sm text-stone-400 mt-0.5">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-stone-600 bg-stone-50 rounded-xl px-3 py-3">
                You are about to permanently delete <span className="font-semibold text-stone-900">{selectedIds.size} user{selectedIds.size !== 1 ? 's' : ''}</span>. All their data will be removed.
              </p>
              {error && (
                <div className="px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">{error}</div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setConfirmBulkDel(false)} className="flex-1 py-2.5 text-sm font-semibold text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete} disabled={bulkDeleting}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-colors"
                >
                  {bulkDeleting ? 'Deleting…' : `Delete ${selectedIds.size} Users`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
