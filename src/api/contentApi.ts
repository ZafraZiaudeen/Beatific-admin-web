import Api from './api'
import type { ContentItem, ContentListResponse } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiData = any

const ContentApi = {
  list: (params?: { itemType?: string; search?: string; category?: string; subcategory?: string }) => {
    const q = new URLSearchParams()
    if (params?.itemType)    q.set('itemType',    params.itemType)
    if (params?.search)      q.set('search',      params.search)
    if (params?.category)    q.set('category',    params.category)
    if (params?.subcategory) q.set('subcategory', params.subcategory)
    const qs = q.toString()
    return Api.get<ContentListResponse>(`/content${qs ? `?${qs}` : ''}`)
  },

  get: (id: string) =>
    Api.get<{ data: ContentItem }>(`/content/${id}`),

  create: (body: {
    name: string
    itemType: string
    category?: string
    subcategory?: string
    tags?: string[]
    pages: object[]
    description?: string
    svgContent?: string
  }) => Api.post<ApiData>('/content', body),

  update: (id: string, body: {
    name?: string
    category?: string
    subcategory?: string
    description?: string
    coverImageUrl?: string
  }) => Api.patch<ApiData>(`/content/${id}`, body),

  savePages: (id: string, pages: object[], svgContent?: string) =>
    Api.put<ApiData>(`/content/${id}/pages`, { pages, svgContent }),

  saveAll: (id: string, body: {
    name?: string
    category?: string
    subcategory?: string
    pages: object[]
    svgContent?: string
  }) => Api.put<ApiData>(`/content/${id}/save-all`, body),

  publish: (id: string, isPublished: boolean) =>
    Api.patch<ApiData>(`/content/${id}/publish`, { isPublished }),

  delete: (id: string, preserveForUsers?: boolean) =>
    Api.del<ApiData>(`/content/${id}`, {
      params: preserveForUsers === undefined ? undefined : { preserveForUsers },
    }),

  stats: () =>
    Api.get<ApiData>('/content/stats'),
}

export type { ContentItem }
export default ContentApi
