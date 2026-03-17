import { createSlice } from '@reduxjs/toolkit'
import type { ContentState } from '../api/types'
import {
  fetchContent,
  createContent,
  updateContent,
  deleteContent,
  toggleContentPublish,
} from '../actions/contentAction'

const initialState: ContentState = {
  items: [],
  loading: false,
  saving: false,
  deleting: null,
  togglingId: null,
  error: null,
}

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clearContentError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // ── Fetch Content ──
    builder.addCase(fetchContent.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchContent.fulfilled, (state, { payload }) => {
      state.loading = false
      state.items = payload.data || []
    })
    builder.addCase(fetchContent.rejected, (state, { payload }) => {
      state.loading = false
      state.error = payload?.message || 'Failed to fetch content'
    })

    // ── Create Content ──
    builder.addCase(createContent.pending, (state) => {
      state.saving = true
      state.error = null
    })
    builder.addCase(createContent.fulfilled, (state) => {
      state.saving = false
    })
    builder.addCase(createContent.rejected, (state, { payload }) => {
      state.saving = false
      state.error = payload?.message || 'Failed to create content'
    })

    // ── Update Content ──
    builder.addCase(updateContent.pending, (state) => {
      state.saving = true
      state.error = null
    })
    builder.addCase(updateContent.fulfilled, (state) => {
      state.saving = false
    })
    builder.addCase(updateContent.rejected, (state, { payload }) => {
      state.saving = false
      state.error = payload?.message || 'Failed to update content'
    })

    // ── Delete Content ──
    builder.addCase(deleteContent.pending, (state, action) => {
      state.deleting = action.meta.arg
      state.error = null
    })
    builder.addCase(deleteContent.fulfilled, (state, action) => {
      state.deleting = null
      state.items = state.items.filter((item) => item._id !== action.payload)
    })
    builder.addCase(deleteContent.rejected, (state, { payload }) => {
      state.deleting = null
      state.error = payload?.message || 'Failed to delete content'
    })

    // ── Toggle Publish ──
    builder.addCase(toggleContentPublish.pending, (state, action) => {
      state.togglingId = action.meta.arg.id
    })
    builder.addCase(toggleContentPublish.fulfilled, (state, action) => {
      state.togglingId = null
      const item = state.items.find((i) => i._id === action.payload.id)
      if (item) {
        item.isPublished = action.payload.isPublished
      }
    })
    builder.addCase(toggleContentPublish.rejected, (state, { payload }) => {
      state.togglingId = null
      state.error = payload?.message || 'Failed to toggle publish status'
    })
  },
})

export const { clearContentError } = contentSlice.actions
export default contentSlice.reducer
