import { createSlice } from '@reduxjs/toolkit'
import type { TemplateItem } from '../api/types'
import {
  fetchTemplates,
  createTemplate,
  deleteTemplate,
  toggleTemplatePublish,
} from '../actions/templateAction'

interface TemplateState {
  items: TemplateItem[]
  loading: boolean
  saving: boolean
  deleting: string | null
  togglingId: string | null
  error: string | null
}

const initialState: TemplateState = {
  items: [],
  loading: false,
  saving: false,
  deleting: null,
  togglingId: null,
  error: null,
}

const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    clearTemplateError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // ── Fetch Templates ──
    builder.addCase(fetchTemplates.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchTemplates.fulfilled, (state, { payload }) => {
      state.loading = false
      state.items = payload.data ?? []
    })
    builder.addCase(fetchTemplates.rejected, (state, { payload }) => {
      state.loading = false
      state.error = payload?.message || 'Failed to fetch templates'
    })

    // ── Create Template ──
    builder.addCase(createTemplate.pending, (state) => {
      state.saving = true
      state.error = null
    })
    builder.addCase(createTemplate.fulfilled, (state) => {
      state.saving = false
    })
    builder.addCase(createTemplate.rejected, (state, { payload }) => {
      state.saving = false
      state.error = payload?.message || 'Failed to create template'
    })

    // ── Delete Template ──
    builder.addCase(deleteTemplate.pending, (state, action) => {
      state.deleting = action.meta.arg.id
      state.error = null
    })
    builder.addCase(deleteTemplate.fulfilled, (state, action) => {
      state.deleting = null
      state.items = state.items.filter((item) => item._id !== action.payload)
    })
    builder.addCase(deleteTemplate.rejected, (state, { payload }) => {
      state.deleting = null
      state.error = payload?.message || 'Failed to delete template'
    })

    // ── Toggle Publish ──
    builder.addCase(toggleTemplatePublish.pending, (state, action) => {
      state.togglingId = action.meta.arg.id
    })
    builder.addCase(toggleTemplatePublish.fulfilled, (state, action) => {
      state.togglingId = null
      const item = state.items.find((i) => i._id === action.payload.id)
      if (item) {
        item.isPublished = action.payload.isPublished
      }
    })
    builder.addCase(toggleTemplatePublish.rejected, (state, { payload }) => {
      state.togglingId = null
      state.error = payload?.message || 'Failed to toggle publish status'
    })
  },
})

export const { clearTemplateError } = templateSlice.actions
export default templateSlice.reducer

