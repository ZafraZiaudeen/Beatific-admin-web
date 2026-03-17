import { createAsyncThunk } from '@reduxjs/toolkit'
import ContentService from '../services/contentService'
import type { ApiError, ContentItem, ContentListResponse } from '../api/types'
import { serializeError } from '../utils/errorSerializer'

export const fetchContent = createAsyncThunk<
  ContentListResponse,
  { itemType?: string; search?: string; category?: string; subcategory?: string },
  { rejectValue: ApiError }
>('content/fetch', async (params, { rejectWithValue }) => {
  try {
    return await ContentService.list(params)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const createContent = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  {
    name: string
    itemType: string
    category?: string
    subcategory?: string
    tags?: string[]
    pages: object[]
    description?: string
    svgContent?: string
  },
  { rejectValue: ApiError }
>('content/create', async (body, { rejectWithValue }) => {
  try {
    return await ContentService.create(body)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const updateContent = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  { id: string; body: { name?: string; category?: string; subcategory?: string; description?: string; coverImageUrl?: string } },
  { rejectValue: ApiError }
>('content/update', async ({ id, body }, { rejectWithValue }) => {
  try {
    return await ContentService.update(id, body)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const deleteContent = createAsyncThunk<
  string,
  string,
  { rejectValue: ApiError }
>('content/delete', async (id, { rejectWithValue }) => {
  try {
    await ContentService.delete(id)
    return id
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const toggleContentPublish = createAsyncThunk<
  { id: string; isPublished: boolean },
  { id: string; isPublished: boolean },
  { rejectValue: ApiError }
>('content/togglePublish', async ({ id, isPublished }, { rejectWithValue }) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await ContentService.publish(id, isPublished)
    return { id, isPublished: res?.data?.isPublished ?? isPublished }
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export type { ContentItem }
