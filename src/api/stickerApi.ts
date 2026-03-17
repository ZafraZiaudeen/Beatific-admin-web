import Api from './api'
import type { StickerItem } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiData = any

const StickerApi = {
  list: (params?: { search?: string; category?: string; subcategory?: string }) => {
    const q = new URLSearchParams()
    if (params?.search)      q.set('search',      params.search)
    if (params?.category)    q.set('category',    params.category)
    if (params?.subcategory) q.set('subcategory', params.subcategory)
    const qs = q.toString()
    return Api.get<{ data: StickerItem[] }>(`/stickers${qs ? `?${qs}` : ''}`)
  },

  get: (id: string) =>
    Api.get<{ data: StickerItem }>(`/stickers/${id}`),

  create: (body: {
    name: string
    category?: string
    subcategory?: string
    tags?: string[]
    pages: object[]
    description?: string
  }) => Api.post<ApiData>('/stickers', body),

  update: (id: string, body: {
    name?: string
    category?: string
    subcategory?: string
    description?: string
  }) => Api.patch<ApiData>(`/stickers/${id}`, body),

  savePages: (id: string, pages: object[]) =>
    Api.put<ApiData>(`/stickers/${id}/pages`, { pages }),

  publish: (id: string, isPublished: boolean) =>
    Api.patch<ApiData>(`/stickers/${id}/publish`, { isPublished }),

  delete: (id: string) =>
    Api.del<ApiData>(`/stickers/${id}`),
}

export type { StickerItem }
export default StickerApi
