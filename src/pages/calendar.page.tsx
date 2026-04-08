import { useCallback, useEffect, useMemo, useState } from 'react'
import ContentApi from '../api/contentApi'
import CalendarScheduleApi, { type CalendarSchedulePayload } from '../api/calendarScheduleApi'
import type { CalendarScheduleItem, ContentItem } from '../api/types'

type FormState = CalendarSchedulePayload & {
  recurrence: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    weekdays: string[]
    dayOfMonth?: number
    startDate: string
    endDate?: string
  }
}

const SLOT_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Anytime']
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function defaultForm(): FormState {
  return {
    contentId: '',
    mode: 'exact',
    visibilityMode: 'date-only',
    exactDate: '',
    exactEndDate: '',
    slotLabel: 'Anytime',
    startTime: '',
    isActive: true,
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      weekdays: ['monday'],
      dayOfMonth: 1,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
    },
  }
}

function toPayload(form: FormState): CalendarSchedulePayload {
  return {
    contentId: form.contentId,
    mode: form.mode,
    visibilityMode: form.mode === 'exact' ? (form.visibilityMode ?? 'date-only') : 'date-only',
    exactDate: form.mode === 'exact' ? form.exactDate || undefined : undefined,
    exactEndDate: form.mode === 'exact' ? form.exactEndDate || undefined : undefined,
    recurrence: form.mode === 'recurring'
      ? {
          frequency: form.recurrence.frequency,
          interval: Number(form.recurrence.interval) || 1,
          weekdays: form.recurrence.frequency === 'weekly' ? form.recurrence.weekdays : undefined,
          dayOfMonth: form.recurrence.frequency === 'monthly' ? Number(form.recurrence.dayOfMonth) || 1 : undefined,
          startDate: form.recurrence.startDate,
          endDate: form.recurrence.endDate || undefined,
        }
      : undefined,
    slotLabel: form.slotLabel || undefined,
    startTime: form.startTime || undefined,
    isActive: form.isActive,
  }
}

function describeSchedule(item: CalendarScheduleItem) {
  if (item.mode === 'exact') {
    if (!item.exactDate) return 'Exact date'
    if (item.exactEndDate && item.exactEndDate !== item.exactDate) {
      return `${item.exactDate} to ${item.exactEndDate}`
    }
    return item.exactDate
  }
  const recurrence = item.recurrence
  if (!recurrence) return 'Recurring'
  if (recurrence.frequency === 'daily') {
    return recurrence.interval > 1 ? `Every ${recurrence.interval} days` : 'Daily'
  }
  if (recurrence.frequency === 'weekly') {
    const days = (recurrence.weekdays ?? []).map((day) => day.slice(0, 3)).join(', ')
    return recurrence.interval > 1 ? `Every ${recurrence.interval} weeks on ${days}` : `Weekly on ${days}`
  }
  return recurrence.interval > 1
    ? `Every ${recurrence.interval} months on day ${recurrence.dayOfMonth}`
    : `Monthly on day ${recurrence.dayOfMonth}`
}

function getScheduleModeLabel(item: CalendarScheduleItem) {
  if (item.mode !== 'exact') return 'Recurring'
  return item.exactEndDate && item.exactEndDate !== item.exactDate ? 'Date Range' : 'Exact Date'
}

function ScheduleEditor({
  form,
  setForm,
  contentOptions,
  previewDates,
  previewing,
  saving,
  error,
  editing,
  onClose,
  onPreview,
  onSave,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  contentOptions: ContentItem[]
  previewDates: string[]
  previewing: boolean
  saving: boolean
  error: string | null
  editing: CalendarScheduleItem | null
  onClose: () => void
  onPreview: () => void
  onSave: () => void
}) {
  return (
    <div className="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center p-6" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-stone-900">{editing ? 'Edit Schedule' : 'New Schedule'}</h2>
            <p className="text-xs text-stone-400 mt-1">Assign published content to exact dates, date ranges, or recurring calendar rules.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="grid md:grid-cols-[1.4fr_0.8fr] gap-0">
          <div className="p-6 space-y-4 border-r border-stone-100">
            <label className="block">
              <span className="text-xs font-semibold text-stone-700">Content</span>
              <select
                value={form.contentId}
                onChange={(e) => setForm((prev) => ({ ...prev, contentId: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                <option value="">Select content</option>
                {contentOptions.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} ({item.itemType})
                  </option>
                ))}
              </select>
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-semibold text-stone-700">Schedule Mode</span>
                <select
                  value={form.mode}
                  onChange={(e) => setForm((prev) => ({ ...prev, mode: e.target.value as 'exact' | 'recurring' }))}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  <option value="exact">Exact date or range</option>
                  <option value="recurring">Recurring</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-stone-700">Status</span>
                <select
                  value={form.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.value === 'active' }))}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>

            {form.mode === 'exact' ? (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-stone-700">Start Date</span>
                    <input
                      type="date"
                      value={form.exactDate ?? ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, exactDate: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-stone-700">End Date</span>
                    <input
                      type="date"
                      value={form.exactEndDate ?? ''}
                      min={form.exactDate || undefined}
                      onChange={(e) => setForm((prev) => ({ ...prev, exactEndDate: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                    <p className="mt-1 text-[11px] text-stone-400">Leave blank to schedule just one day.</p>
                  </label>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-stone-700">Journal Visibility</span>
                    <p className="mt-1 text-xs text-stone-500">
                      Choose whether this dated journal stays visible in normal journal shelves outside its scheduled date window.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, visibilityMode: 'date-only' }))}
                      className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                        (form.visibilityMode ?? 'date-only') === 'date-only'
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <div className="text-xs font-semibold">Date only</div>
                      <div className={`mt-1 text-xs ${(form.visibilityMode ?? 'date-only') === 'date-only' ? 'text-stone-200' : 'text-stone-500'}`}>
                        Show it in calendar surfaces and in normal journal cards only during its scheduled date range.
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, visibilityMode: 'always-visible' }))}
                      className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                        form.visibilityMode === 'always-visible'
                          ? 'border-sky-600 bg-sky-600 text-white'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <div className="text-xs font-semibold">Always visible</div>
                      <div className={`mt-1 text-xs ${form.visibilityMode === 'always-visible' ? 'text-sky-100' : 'text-stone-500'}`}>
                        Also keep it visible in normal journal shelves before and after the scheduled date range.
                      </div>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-stone-200 p-4 space-y-4 bg-stone-50/50">
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-stone-700">Frequency</span>
                    <select
                      value={form.recurrence.frequency}
                      onChange={(e) => setForm((prev) => ({
                        ...prev,
                        recurrence: { ...prev.recurrence, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' },
                      }))}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-stone-700">Interval</span>
                    <input
                      type="number"
                      min={1}
                      value={form.recurrence.interval}
                      onChange={(e) => setForm((prev) => ({
                        ...prev,
                        recurrence: { ...prev.recurrence, interval: Math.max(1, Number(e.target.value) || 1) },
                      }))}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                    />
                  </label>
                </div>

                {form.recurrence.frequency === 'weekly' && (
                  <div>
                    <span className="text-xs font-semibold text-stone-700">Weekdays</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {WEEKDAYS.map((day) => {
                        const active = form.recurrence.weekdays.includes(day)
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => setForm((prev) => ({
                              ...prev,
                              recurrence: {
                                ...prev.recurrence,
                                weekdays: active
                                  ? prev.recurrence.weekdays.filter((value) => value !== day)
                                  : [...prev.recurrence.weekdays, day],
                              },
                            }))}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              active
                                ? 'bg-stone-900 text-white border-stone-900'
                                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {form.recurrence.frequency === 'monthly' && (
                  <label className="block">
                    <span className="text-xs font-semibold text-stone-700">Day of Month</span>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={form.recurrence.dayOfMonth ?? 1}
                      onChange={(e) => setForm((prev) => ({
                        ...prev,
                        recurrence: { ...prev.recurrence, dayOfMonth: Math.max(1, Math.min(31, Number(e.target.value) || 1)) },
                      }))}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                    />
                  </label>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-stone-700">Start Date</span>
                    <input
                      type="date"
                      value={form.recurrence.startDate}
                      onChange={(e) => setForm((prev) => ({
                        ...prev,
                        recurrence: { ...prev.recurrence, startDate: e.target.value },
                      }))}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-stone-700">End Date</span>
                    <input
                      type="date"
                      value={form.recurrence.endDate ?? ''}
                      onChange={(e) => setForm((prev) => ({
                        ...prev,
                        recurrence: { ...prev.recurrence, endDate: e.target.value },
                      }))}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                    />
                  </label>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Recurring schedules always stay date-only in normal journal shelves to avoid clutter across many dates.
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-semibold text-stone-700">Slot Label</span>
                <select
                  value={form.slotLabel ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, slotLabel: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  {SLOT_OPTIONS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-stone-700">Start Time</span>
                <input
                  type="time"
                  value={form.startTime ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </label>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onPreview}
                disabled={previewing}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-50"
              >
                {previewing ? 'Previewing…' : 'Preview Upcoming Dates'}
              </button>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50">
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Schedule'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-stone-50/60">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Preview</h3>
            <p className="text-xs text-stone-500 mt-2">Upcoming generated dates for the current form.</p>
            <div className="mt-4 rounded-2xl border border-stone-200 bg-white min-h-[280px] p-4">
              {previewDates.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-stone-400 text-center">
                  Run preview to inspect the next generated occurrences.
                </div>
              ) : (
                <div className="space-y-2">
                  {previewDates.map((date) => (
                    <div key={date} className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-100 text-sm text-stone-700">
                      {date}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const [schedules, setSchedules] = useState<CalendarScheduleItem[]>([])
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CalendarScheduleItem | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm())
  const [previewDates, setPreviewDates] = useState<string[]>([])
  const [previewing, setPreviewing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const schedulableContent = useMemo(
    () => contentItems.filter((item) => item.isPublished && !['sticker', 'page'].includes(String(item.itemType || '').toLowerCase())),
    [contentItems]
  )

  const load = useCallback(async (options?: { showLoader?: boolean }) => {
    const showLoader = options?.showLoader ?? true
    if (showLoader) {
      setLoading(true)
    }
    try {
      const [scheduleRes, contentRes] = await Promise.all([
        CalendarScheduleApi.list(),
        ContentApi.list(),
      ])
      setSchedules(scheduleRes.data ?? [])
      setContentItems(contentRes.data ?? [])
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load calendar schedules'))
    } finally {
      if (showLoader) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm())
    setPreviewDates([])
    setError(null)
    setModalOpen(true)
  }

  const openEdit = (schedule: CalendarScheduleItem) => {
    setEditing(schedule)
    setForm({
      contentId: schedule.contentId,
      mode: schedule.mode,
      visibilityMode: schedule.visibilityMode ?? 'date-only',
      exactDate: schedule.exactDate ?? '',
      exactEndDate: schedule.exactEndDate ?? '',
      slotLabel: schedule.slotLabel ?? 'Anytime',
      startTime: schedule.startTime ?? '',
      isActive: schedule.isActive,
      recurrence: {
        frequency: schedule.recurrence?.frequency ?? 'weekly',
        interval: schedule.recurrence?.interval ?? 1,
        weekdays: schedule.recurrence?.weekdays ?? ['monday'],
        dayOfMonth: schedule.recurrence?.dayOfMonth ?? 1,
        startDate: schedule.recurrence?.startDate ?? new Date().toISOString().slice(0, 10),
        endDate: schedule.recurrence?.endDate ?? '',
      },
    })
    setPreviewDates(schedule.upcomingDates ?? [])
    setError(null)
    setModalOpen(true)
  }

  const handlePreview = async () => {
    setPreviewing(true)
    setError(null)
    try {
      const res = await CalendarScheduleApi.preview(toPayload(form))
      setPreviewDates(res.data ?? [])
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to preview schedule'))
    } finally {
      setPreviewing(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      if (editing?._id) {
        await CalendarScheduleApi.update(editing._id, toPayload(form))
      } else {
        await CalendarScheduleApi.create(toPayload(form))
      }
      setModalOpen(false)
      await load()
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save schedule'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (schedule: CalendarScheduleItem) => {
    if (!window.confirm(`Delete schedule for "${schedule.content?.name ?? 'this content'}"? Untouched future journals will be removed.`)) return
    setDeletingScheduleId(schedule._id)
    setError(null)
    try {
      await CalendarScheduleApi.delete(schedule._id)
      setSchedules((current) => current.filter((item) => item._id !== schedule._id))
      void load({ showLoader: false })
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete schedule'))
    } finally {
      setDeletingScheduleId(null)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50/50">
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Calendar Scheduling</h1>
            <p className="text-xs text-stone-400 mt-0.5">
              Assign published planner content to exact dates, multi-day ranges, and rolling recurring schedules.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            New Schedule
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6">
        {error && !modalOpen && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-40 rounded-2xl bg-stone-100 animate-pulse" />
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-20 text-center">
            <div className="text-base font-semibold text-stone-700">No schedules yet</div>
            <p className="text-sm text-stone-400 mt-2">Create an exact or recurring schedule to populate the calendar in the app.</p>
            <button onClick={openCreate} className="mt-5 px-5 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-700">
              Create Schedule
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((schedule) => (
              <div key={schedule._id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                      {getScheduleModeLabel(schedule)}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-stone-900 truncate">
                      {schedule.content?.name ?? 'Unknown content'}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">{describeSchedule(schedule)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${
                    schedule.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-stone-50 text-stone-500 border-stone-200'
                  }`}>
                    {schedule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {schedule.slotLabel && (
                    <span className="px-2 py-1 rounded-full text-[11px] bg-stone-100 text-stone-700">
                      {schedule.slotLabel}
                    </span>
                  )}
                  {schedule.startTime && (
                    <span className="px-2 py-1 rounded-full text-[11px] bg-sky-50 text-sky-700">
                      {schedule.startTime}
                    </span>
                  )}
                  {schedule.content?.itemType && (
                    <span className="px-2 py-1 rounded-full text-[11px] bg-violet-50 text-violet-700 capitalize">
                      {schedule.content.itemType}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-[11px] ${
                    (schedule.visibilityMode ?? 'date-only') === 'always-visible'
                      ? 'bg-sky-50 text-sky-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {(schedule.visibilityMode ?? 'date-only') === 'always-visible' ? 'Always visible' : 'Date only'}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Upcoming</p>
                  <div className="flex flex-wrap gap-2">
                    {(schedule.upcomingDates ?? []).slice(0, 6).map((date) => (
                      <span key={date} className="px-2 py-1 rounded-lg bg-stone-50 border border-stone-100 text-xs text-stone-600">
                        {date}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(schedule)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-700 hover:bg-sky-50">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(schedule)}
                    disabled={deletingScheduleId === schedule._id}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingScheduleId === schedule._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <ScheduleEditor
          form={form}
          setForm={setForm}
          contentOptions={schedulableContent}
          previewDates={previewDates}
          previewing={previewing}
          saving={saving}
          error={error}
          editing={editing}
          onClose={() => setModalOpen(false)}
          onPreview={() => void handlePreview()}
          onSave={() => void handleSave()}
        />
      )}
    </div>
  )
}
