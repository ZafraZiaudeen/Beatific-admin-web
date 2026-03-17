import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type AdminView =
  | 'signin'
  | 'signup'
  | 'dashboard'
  | 'templates'
  | 'stickers'
  | 'templateEditor'
  | 'stickerEditor'

interface UiState {
  currentView: AdminView
  editingId: string | null
  sidebarCollapsed: boolean
  toast: { msg: string; type: 'success' | 'error' | 'info' | 'warning' } | null
}

const initialState: UiState = {
  currentView: 'signin',
  editingId: null,
  sidebarCollapsed: false,
  toast: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<AdminView>) => {
      state.currentView = action.payload
    },
    setEditingId: (state, action: PayloadAction<string | null>) => {
      state.editingId = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setToast: (state, action: PayloadAction<{ msg: string; type: 'success' | 'error' | 'info' | 'warning' }>) => {
      state.toast = action.payload
    },
    clearToast: (state) => {
      state.toast = null
    },
  },
})

export const { setView, setEditingId, toggleSidebar, setToast, clearToast } = uiSlice.actions
export default uiSlice.reducer
