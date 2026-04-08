import Api from './api'
import type { CalendarScheduleItem, CalendarRecurrence } from './types'

export type CalendarSchedulePayload = {
  contentId: string
  mode: 'exact' | 'recurring'
  visibilityMode?: 'date-only' | 'always-visible'
  exactDate?: string
  exactEndDate?: string
  recurrence?: CalendarRecurrence
  slotLabel?: string
  startTime?: string
  isActive: boolean
}

const CalendarScheduleApi = {
  list: () =>
    Api.get<{ success: boolean; data: CalendarScheduleItem[] }>('/calendar-schedules'),

  preview: (body: Partial<CalendarSchedulePayload>) =>
    Api.post<{ success: boolean; data: string[] }, Partial<CalendarSchedulePayload>>('/calendar-schedules/preview', body),

  create: (body: CalendarSchedulePayload) =>
    Api.post<{ success: boolean; data: CalendarScheduleItem }, CalendarSchedulePayload>('/calendar-schedules', body),

  update: (id: string, body: CalendarSchedulePayload) =>
    Api.patch<{ success: boolean; data: CalendarScheduleItem }, CalendarSchedulePayload>(`/calendar-schedules/${id}`, body),

  delete: (id: string) =>
    Api.del<{ success: boolean; message: string }>(`/calendar-schedules/${id}`),
}

export default CalendarScheduleApi
