import { createSlice } from '@reduxjs/toolkit'
import {
  updateAdminProfile,
  changeAdminPassword,
  uploadAdminAvatar,
} from '../actions/profileAction'

interface ProfileState {
  saving: boolean
  error: string | null
}

const initialState: ProfileState = {
  saving: false,
  error: null,
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // ── Update Profile ──
    builder.addCase(updateAdminProfile.pending, (state) => {
      state.saving = true
      state.error = null
    })
    builder.addCase(updateAdminProfile.fulfilled, (state) => {
      state.saving = false
    })
    builder.addCase(updateAdminProfile.rejected, (state, { payload }) => {
      state.saving = false
      state.error = payload?.message || 'Failed to update profile'
    })

    // ── Change Password ──
    builder.addCase(changeAdminPassword.pending, (state) => {
      state.saving = true
      state.error = null
    })
    builder.addCase(changeAdminPassword.fulfilled, (state) => {
      state.saving = false
    })
    builder.addCase(changeAdminPassword.rejected, (state, { payload }) => {
      state.saving = false
      state.error = payload?.message || 'Failed to change password'
    })

    // ── Upload Avatar ──
    builder.addCase(uploadAdminAvatar.pending, (state) => {
      state.saving = true
      state.error = null
    })
    builder.addCase(uploadAdminAvatar.fulfilled, (state) => {
      state.saving = false
    })
    builder.addCase(uploadAdminAvatar.rejected, (state, { payload }) => {
      state.saving = false
      state.error = payload?.message || 'Failed to upload avatar'
    })
  },
})

export const { clearProfileError } = profileSlice.actions
export default profileSlice.reducer
