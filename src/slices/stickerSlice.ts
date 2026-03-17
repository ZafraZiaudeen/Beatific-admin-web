import { createSlice } from '@reduxjs/toolkit'
import type { StickerItem } from '../api/types'
import {
  fetchStickers,
  createSticker,
  deleteSticker,
  toggleStickerPublish,
} from '../actions/stickerAction'

interface StickerState {
  items: StickerItem[]
  loading: boolean
  saving: boolean
  deleting: string | null
  togglingId: string | null
  error: string | null
}

const initialState: StickerState = {
  items: [],
  loading: false,
  saving: false,
  deleting: null,
  togglingId: null,
  error: null,
}

const stickerSlice = createSlice({
  name: 'stickers',
  initialState,
  reducers: {
    clearStickerError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // ── Fetch Stickers ──
    builder.addCase(fetchStickers.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchStickers.fulfilled, (state, { payload }) => {
      state.loading = false
      state.items = payload.data ?? []
    })
    builder.addCase(fetchStickers.rejected, (state, { payload }) => {
      state.loading = false
      state.error = payload?.message || 'Failed to fetch stickers'
    })

    // ── Create Sticker ──
    builder.addCase(createSticker.pending, (state) => {
      state.saving = true
      state.error = null
    })
    builder.addCase(createSticker.fulfilled, (state) => {
      state.saving = false
    })
    builder.addCase(createSticker.rejected, (state, { payload }) => {
      state.saving = false
      state.error = payload?.message || 'Failed to create sticker'
    })

    // ── Delete Sticker ──
    builder.addCase(deleteSticker.pending, (state, action) => {
      state.deleting = action.meta.arg
      state.error = null
    })
    builder.addCase(deleteSticker.fulfilled, (state, action) => {
      state.deleting = null
      state.items = state.items.filter((item) => item._id !== action.payload)
    })
    builder.addCase(deleteSticker.rejected, (state, { payload }) => {
      state.deleting = null
      state.error = payload?.message || 'Failed to delete sticker'
    })

    // ── Toggle Publish ──
    builder.addCase(toggleStickerPublish.pending, (state, action) => {
      state.togglingId = action.meta.arg.id
    })
    builder.addCase(toggleStickerPublish.fulfilled, (state, action) => {
      state.togglingId = null
      const item = state.items.find((i) => i._id === action.payload.id)
      if (item) {
        item.isPublished = action.payload.isPublished
      }
    })
    builder.addCase(toggleStickerPublish.rejected, (state, { payload }) => {
      state.togglingId = null
      state.error = payload?.message || 'Failed to toggle publish status'
    })
  },
})

export const { clearStickerError } = stickerSlice.actions
export default stickerSlice.reducer
