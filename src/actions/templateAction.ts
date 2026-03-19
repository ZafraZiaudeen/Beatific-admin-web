import { createAsyncThunk } from '@reduxjs/toolkit'
import TemplateService from '../services/templateService'
import type { ApiError, TemplateItem } from '../api/types'
import { serializeError } from '../utils/errorSerializer'

export const fetchTemplates = createAsyncThunk<
  { data: TemplateItem[] },
  { search?: string; category?: string; subcategory?: string } | void,
  { rejectValue: ApiError }
>('templates/fetch', async (params, { rejectWithValue }) => {
  try {
    return await TemplateService.list(params ?? undefined)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const createTemplate = createAsyncThunk<
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
>('templates/create', async (body, { rejectWithValue }) => {
  try {
    return await TemplateService.create(body)
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const deleteTemplate = createAsyncThunk<
  string,
  { id: string; preserveForUsers?: boolean },
  { rejectValue: ApiError }
>('templates/delete', async ({ id, preserveForUsers }, { rejectWithValue }) => {
  try {
    await TemplateService.delete(id, preserveForUsers)
    return id
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})

export const toggleTemplatePublish = createAsyncThunk<
  { id: string; isPublished: boolean },
  { id: string; isPublished: boolean },
  { rejectValue: ApiError }
>('templates/togglePublish', async ({ id, isPublished }, { rejectWithValue }) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await TemplateService.publish(id, isPublished)
    return { id, isPublished: res?.data?.isPublished ?? isPublished }
  } catch (error) {
    return rejectWithValue(serializeError(error))
  }
})
