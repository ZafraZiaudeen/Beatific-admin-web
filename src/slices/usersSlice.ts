import { createSlice } from '@reduxjs/toolkit'
import type { UsersState, AdminUser, AppUser } from '../api/types'
import {
  fetchAdminUsers,
  fetchAppUsers,
  createAdminUser,
  createAppUser,
  updateAdminUserRole,
  toggleAdminUserBan,
  toggleAppUserBan,
  resetAdminUserPassword,
  resetAppUserPassword,
  deleteAdminUser,
  deleteAppUser,
  bulkDeleteAdminUsers,
  bulkDeleteAppUsers,
} from '../actions/userAction'

const initialState: UsersState = {
  adminUsers: [],
  appUsers: [],
  adminTotal: 0,
  appTotal: 0,
  adminPages: 1,
  appPages: 1,
  loading: false,
  error: null,
  actionLoading: false,
  actionError: null,
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserErrors: (state) => {
      state.error = null
      state.actionError = null
    },
  },
  extraReducers: (builder) => {
    // ── Fetch Admin Users ──
    builder.addCase(fetchAdminUsers.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchAdminUsers.fulfilled, (state, { payload }) => {
      state.loading = false
      state.adminUsers = payload.users as AdminUser[]
      state.adminTotal = payload.total
      state.adminPages = payload.pages
    })
    builder.addCase(fetchAdminUsers.rejected, (state, { payload }) => {
      state.loading = false
      state.error = payload?.message || 'Failed to fetch admin users'
    })

    // ── Fetch App Users ──
    builder.addCase(fetchAppUsers.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchAppUsers.fulfilled, (state, { payload }) => {
      state.loading = false
      state.appUsers = payload.users as AppUser[]
      state.appTotal = payload.total
      state.appPages = payload.pages
    })
    builder.addCase(fetchAppUsers.rejected, (state, { payload }) => {
      state.loading = false
      state.error = payload?.message || 'Failed to fetch app users'
    })

    // ── Create Admin User ──
    builder.addCase(createAdminUser.pending, (state) => {
      state.actionLoading = true
      state.actionError = null
    })
    builder.addCase(createAdminUser.fulfilled, (state) => {
      state.actionLoading = false
    })
    builder.addCase(createAdminUser.rejected, (state, { payload }) => {
      state.actionLoading = false
      state.actionError = payload?.message || 'Failed to create admin user'
    })

    // ── Create App User ──
    builder.addCase(createAppUser.pending, (state) => {
      state.actionLoading = true
      state.actionError = null
    })
    builder.addCase(createAppUser.fulfilled, (state) => {
      state.actionLoading = false
    })
    builder.addCase(createAppUser.rejected, (state, { payload }) => {
      state.actionLoading = false
      state.actionError = payload?.message || 'Failed to create app user'
    })

    // ── Update Admin Role ──
    builder.addCase(updateAdminUserRole.pending, (state) => {
      state.actionLoading = true
      state.actionError = null
    })
    builder.addCase(updateAdminUserRole.fulfilled, (state, action) => {
      state.actionLoading = false
      const user = state.adminUsers.find(u => u.id === action.meta.arg.id || u._id === action.meta.arg.id)
      if (user) {
        user.role = action.meta.arg.role as 'super_admin' | 'admin' | 'editor'
      }
    })
    builder.addCase(updateAdminUserRole.rejected, (state, { payload }) => {
      state.actionLoading = false
      state.actionError = payload?.message || 'Failed to update user role'
    })

    // ── Toggle Admin Ban ──
    builder.addCase(toggleAdminUserBan.pending, (state) => {
      state.actionLoading = true
      state.actionError = null
    })
    builder.addCase(toggleAdminUserBan.fulfilled, (state, action) => {
      state.actionLoading = false
      const user = state.adminUsers.find(u => u.id === action.meta.arg || u._id === action.meta.arg)
      if (user) {
        user.isBanned = !user.isBanned
      }
    })
    builder.addCase(toggleAdminUserBan.rejected, (state, { payload }) => {
      state.actionLoading = false
      state.actionError = payload?.message || 'Failed to toggle ban'
    })

    // ── Toggle App Ban ──
    builder.addCase(toggleAppUserBan.pending, (state) => {
      state.actionLoading = true
      state.actionError = null
    })
    builder.addCase(toggleAppUserBan.fulfilled, (state, action) => {
      state.actionLoading = false
      const user = state.appUsers.find(u => u._id === action.meta.arg)
      if (user) {
        user.isBanned = !user.isBanned
      }
    })
    builder.addCase(toggleAppUserBan.rejected, (state, { payload }) => {
      state.actionLoading = false
      state.actionError = payload?.message || 'Failed to toggle ban'
    })

    // ── Reset Admin Password ──
    builder.addCase(resetAdminUserPassword.pending, (state) => {
      state.actionLoading = true
      state.actionError = null
    })
    builder.addCase(resetAdminUserPassword.fulfilled, (state) => {
      state.actionLoading = false
    })
    builder.addCase(resetAdminUserPassword.rejected, (state, { payload }) => {
      state.actionLoading = false
      state.actionError = payload?.message || 'Failed to reset password'
    })

    // ── Reset App Password ──
    builder.addCase(resetAppUserPassword.pending, (state) => {
      state.actionLoading = true
      state.actionError = null
    })
    builder.addCase(resetAppUserPassword.fulfilled, (state) => {
      state.actionLoading = false
    })
    builder.addCase(resetAppUserPassword.rejected, (state, { payload }) => {
      state.actionLoading = false
      state.actionError = payload?.message || 'Failed to reset password'
    })

    // ── Delete Admin User ──
    builder.addCase(deleteAdminUser.pending, (state) => {
      state.actionLoading = true
      state.actionError = null
    })
    builder.addCase(deleteAdminUser.fulfilled, (state, action) => {
      state.actionLoading = false
      state.adminUsers = state.adminUsers.filter(u => u.id !== action.meta.arg && u._id !== action.meta.arg)
      state.adminTotal -= 1
    })
    builder.addCase(deleteAdminUser.rejected, (state, { payload }) => {
      state.actionLoading = false
      state.actionError = payload?.message || 'Failed to delete user'
    })

    // ── Delete App User ──
    builder.addCase(deleteAppUser.pending, (state) => {
      state.actionLoading = true
      state.actionError = null
    })
    builder.addCase(deleteAppUser.fulfilled, (state, action) => {
      state.actionLoading = false
      state.appUsers = state.appUsers.filter(u => u._id !== action.meta.arg)
      state.appTotal -= 1
    })
    builder.addCase(deleteAppUser.rejected, (state, { payload }) => {
      state.actionLoading = false
      state.actionError = payload?.message || 'Failed to delete user'
    })

    // ── Bulk Delete Admin Users ──
    builder.addCase(bulkDeleteAdminUsers.pending, (state) => {
      state.actionLoading = true
      state.actionError = null
    })
    builder.addCase(bulkDeleteAdminUsers.fulfilled, (state, action) => {
      state.actionLoading = false
      const ids = action.meta.arg
      state.adminUsers = state.adminUsers.filter(u => !ids.includes(u.id) && !(u._id && ids.includes(u._id)))
      state.adminTotal -= ids.length
    })
    builder.addCase(bulkDeleteAdminUsers.rejected, (state, { payload }) => {
      state.actionLoading = false
      state.actionError = payload?.message || 'Failed to bulk delete'
    })

    // ── Bulk Delete App Users ──
    builder.addCase(bulkDeleteAppUsers.pending, (state) => {
      state.actionLoading = true
      state.actionError = null
    })
    builder.addCase(bulkDeleteAppUsers.fulfilled, (state, action) => {
      state.actionLoading = false
      const ids = action.meta.arg
      state.appUsers = state.appUsers.filter(u => !ids.includes(u._id))
      state.appTotal -= ids.length
    })
    builder.addCase(bulkDeleteAppUsers.rejected, (state, { payload }) => {
      state.actionLoading = false
      state.actionError = payload?.message || 'Failed to bulk delete'
    })
  },
})

export const { clearUserErrors } = usersSlice.actions
export default usersSlice.reducer
