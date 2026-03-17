import { createSlice } from '@reduxjs/toolkit'
import type { SettingsState } from '../api/types'
import {
  fetchSettings,
  updateGeneralSettings,
  updateSecuritySettings,
  updateVerificationSettings,
  updateNotificationSettings,
} from '../actions/settingsAction'

const initialState: SettingsState = {
  data: null,
  loading: false,
  saving: false,
  error: null,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // ── Fetch ──
    builder.addCase(fetchSettings.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchSettings.fulfilled, (state, { payload }) => {
      state.loading = false
      state.data = payload
    })
    builder.addCase(fetchSettings.rejected, (state, { payload }) => {
      state.loading = false
      state.error = payload?.message || 'Failed to fetch settings'
    })

    // ── Update Helpers ──
    const handleUpdatePending = (state: SettingsState) => {
      state.saving = true
      state.error = null
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUpdateFulfilled = (state: SettingsState, { payload }: { payload: any }) => {
      state.saving = false
      state.data = { ...state.data, ...payload } as any
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUpdateRejected = (state: SettingsState, { payload }: { payload: any }) => {
      state.saving = false
      state.error = payload?.message || 'Failed to update settings'
    }

    // General
    builder.addCase(updateGeneralSettings.pending, handleUpdatePending)
    builder.addCase(updateGeneralSettings.fulfilled, handleUpdateFulfilled)
    builder.addCase(updateGeneralSettings.rejected, handleUpdateRejected)

    // Security
    builder.addCase(updateSecuritySettings.pending, handleUpdatePending)
    builder.addCase(updateSecuritySettings.fulfilled, handleUpdateFulfilled)
    builder.addCase(updateSecuritySettings.rejected, handleUpdateRejected)

    // Verification
    builder.addCase(updateVerificationSettings.pending, handleUpdatePending)
    builder.addCase(updateVerificationSettings.fulfilled, handleUpdateFulfilled)
    builder.addCase(updateVerificationSettings.rejected, handleUpdateRejected)

    // Notifications
    builder.addCase(updateNotificationSettings.pending, handleUpdatePending)
    builder.addCase(updateNotificationSettings.fulfilled, handleUpdateFulfilled)
    builder.addCase(updateNotificationSettings.rejected, handleUpdateRejected)
  },
})

export const { clearSettingsError } = settingsSlice.actions
export default settingsSlice.reducer
