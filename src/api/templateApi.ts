import Api from './api'
import type { TemplateItem } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiData = any

const TemplateApi = {
  list: (params?: { search?: string; category?: string; subcategory?: string }) => {
    const q = new URLSearchParams()
    if (params?.search)      q.set('search',      params.search)
    if (params?.category)    q.set('category',    params.category)
    if (params?.subcategory) q.set('subcategory', params.subcategory)
    const qs = q.toString()
    return Api.get<{ data: TemplateItem[] }>(`/templates${qs ? `?${qs}` : ''}`)
  },

  get: (id: string) =>
    Api.get<{ data: TemplateItem }>(`/templates/${id}`),

  create: (body: {
    name: string
    category?: string
    subcategory?: string
    tags?: string[]
    pages: object[]
    description?: string
  }) => Api.post<ApiData>('/templates', body),

  update: (id: string, body: {
    name?: string
    category?: string
    subcategory?: string
    description?: string
  }) => Api.patch<ApiData>(`/templates/${id}`, body),

  savePages: (id: string, pages: object[]) =>
    Api.put<ApiData>(`/templates/${id}/pages`, { pages }),

  publish: (id: string, isPublished: boolean) =>
    Api.patch<ApiData>(`/templates/${id}/publish`, { isPublished }),

  delete: (id: string, preserveForUsers?: boolean) =>
    Api.del<ApiData>(`/templates/${id}`, {
      params: preserveForUsers === undefined ? undefined : { preserveForUsers },
    }),
}

export type { TemplateItem }
export default TemplateApi
