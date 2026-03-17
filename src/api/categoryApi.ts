import Api from './api'
import type { CategoryItem, MainCategory } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiData = any

export const MainCategoryApi = {
  list: () =>
    Api.get<{ data: MainCategory[] }>('/main-categories'),

  get: (id: string) =>
    Api.get<{ data: MainCategory }>(`/main-categories/${id}`),

  create: (body: {
    name: string
    slug?: string
    icon?: string
    color?: string
    order?: number
  }) => Api.post<ApiData>('/main-categories', body),

  update: (id: string, body: {
    name?: string
    slug?: string
    icon?: string
    color?: string
    order?: number
  }) => Api.patch<ApiData>(`/main-categories/${id}`, body),

  delete: (id: string) =>
    Api.del<ApiData>(`/main-categories/${id}`),
}

export const CategoryApi = {
  list: (itemType?: string) =>
    Api.get<{ data: CategoryItem[] }>(`/categories${itemType ? `?itemType=${itemType}` : ''}`),

  get: (id: string) =>
    Api.get<{ data: CategoryItem }>(`/categories/${id}`),

  create: (body: {
    name: string
    slug?: string
    icon?: string
    color?: string
    itemType: string
    subcategories?: { name: string; slug?: string }[]
    order?: number
  }) => Api.post<ApiData>('/categories', body),

  update: (id: string, body: {
    name?: string
    slug?: string
    icon?: string
    color?: string
    subcategories?: { name: string; slug?: string }[]
    order?: number
  }) => Api.patch<ApiData>(`/categories/${id}`, body),

  addSubcategory: (id: string, sub: { name: string; slug?: string }) =>
    Api.post<ApiData>(`/categories/${id}/subcategories`, sub),

  removeSubcategory: (id: string, slug: string) =>
    Api.del<ApiData>(`/categories/${id}/subcategories/${slug}`),

  delete: (id: string) =>
    Api.del<ApiData>(`/categories/${id}`),
}
