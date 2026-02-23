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
}

const initialState: UiState = {
  currentView: 'signin',
  editingId: null,
  sidebarCollapsed: false,
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
  },
})

export const { setView, setEditingId, toggleSidebar } = uiSlice.actions
export default uiSlice.reducer
