import { createAsyncThunk } from '@reduxjs/toolkit'
import StickerService from '../services/stickerService'
import type { ApiError, StickerItem } from '../api/types'
import { serializeError } from '../utils/errorSerializer'

export const fetchStickers = createAsyncThunk<
  { data: StickerItem[] },
  { search?: string; category?: string; subcategory?: string } | void,
  { rejectValue: ApiError }
>('stickers/fetch', async (params, { rejectWithValue }) => {
  try {
    return await StickerService.list(params ?? undefined)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const createSticker = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  {
    name: string
    category?: string
    subcategory?: string
    tags?: string[]
    pages: object[]
    description?: string
  },
  { rejectValue: ApiError }
>('stickers/create', async (body, { rejectWithValue }) => {
  try {
    return await StickerService.create(body)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const deleteSticker = createAsyncThunk<
  string,
  string,
  { rejectValue: ApiError }
>('stickers/delete', async (id, { rejectWithValue }) => {
  try {
    await StickerService.delete(id)
    return id
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const toggleStickerPublish = createAsyncThunk<
  { id: string; isPublished: boolean },
  { id: string; isPublished: boolean },
  { rejectValue: ApiError }
>('stickers/togglePublish', async ({ id, isPublished }, { rejectWithValue }) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await StickerService.publish(id, isPublished)
    return { id, isPublished: res?.data?.isPublished ?? isPublished }
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})
