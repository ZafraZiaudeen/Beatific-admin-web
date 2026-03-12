import Api from './api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiData = any

// ── Unified Content API (NEW) ────────────────────────────
export const contentApi = {
  list: (params?: { itemType?: string; search?: string; category?: string; subcategory?: string }) => {
    const q = new URLSearchParams()
    if (params?.itemType)    q.set('itemType',    params.itemType)
    if (params?.search)      q.set('search',      params.search)
    if (params?.category)    q.set('category',    params.category)
    if (params?.subcategory) q.set('subcategory', params.subcategory)
    const qs = q.toString()
    return Api.request<ApiData>({ url: `/content${qs ? `?${qs}` : ''}`, method: 'GET' })
  },

  get: (id: string) =>
    Api.request<ApiData>({ url: `/content/${id}`, method: 'GET' }),

  create: (body: {
    name: string
    itemType: string
    category?: string
    subcategory?: string
    tags?: string[]
    pages: object[]
    description?: string
    svgContent?: string
  }) =>
    Api.request<ApiData>({ url: '/content', method: 'POST', data: body }),

  update: (id: string, body: { name?: string; category?: string; subcategory?: string; description?: string; coverImageUrl?: string }) =>
    Api.request<ApiData>({ url: `/content/${id}`, method: 'PATCH', data: body }),

  savePages: (id: string, pages: object[], svgContent?: string) =>
    Api.request<ApiData>({ url: `/content/${id}/pages`, method: 'PUT', data: { pages, svgContent } }),

  publish: (id: string, isPublished: boolean) =>
    Api.request<ApiData>({
      url: `/content/${id}/publish`,
      method: 'PATCH',
      data: { isPublished },
    }),

  delete: (id: string) =>
    Api.request<ApiData>({ url: `/content/${id}`, method: 'DELETE' }),

  stats: () =>
    Api.request<ApiData>({ url: '/content/stats', method: 'GET' }),
}

// ── Media Upload API ─────────────────────────────────────
export const mediaApi = {
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return Api.request<ApiData>({ url: '/media/upload', method: 'POST', data: form })
  },
}

// ── Legacy APIs (DEPRECATED - use contentApi) ────────────
export const templateApi = {
  list: (params?: { search?: string; category?: string; subcategory?: string }) => {
    const q = new URLSearchParams()
    if (params?.search)      q.set('search',      params.search)
    if (params?.category)    q.set('category',    params.category)
    if (params?.subcategory) q.set('subcategory', params.subcategory)
    const qs = q.toString()
    return Api.request<ApiData>({ url: `/templates${qs ? `?${qs}` : ''}`, method: 'GET' })
  },

  get: (id: string) =>
    Api.request<ApiData>({ url: `/templates/${id}`, method: 'GET' }),

  create: (body: {
    name: string
    category?: string
    subcategory?: string
    tags?: string[]
    pages: object[]
    description?: string
  }) =>
    Api.request<ApiData>({ url: '/templates', method: 'POST', data: body }),

  update: (id: string, body: { name?: string; category?: string; subcategory?: string; description?: string }) =>
    Api.request<ApiData>({ url: `/templates/${id}`, method: 'PATCH', data: body }),

  savePages: (id: string, pages: object[]) =>
    Api.request<ApiData>({ url: `/templates/${id}/pages`, method: 'PUT', data: { pages } }),

  publish: (id: string, isPublished: boolean) =>
    Api.request<ApiData>({
      url: `/templates/${id}/publish`,
      method: 'PATCH',
      data: { isPublished },
    }),

  delete: (id: string) =>
    Api.request<ApiData>({ url: `/templates/${id}`, method: 'DELETE' }),
}

export const stickerApi = {
  list: (params?: { search?: string; category?: string; subcategory?: string }) => {
    const q = new URLSearchParams()
    if (params?.search)      q.set('search',      params.search)
    if (params?.category)    q.set('category',    params.category)
    if (params?.subcategory) q.set('subcategory', params.subcategory)
    const qs = q.toString()
    return Api.request<ApiData>({ url: `/stickers${qs ? `?${qs}` : ''}`, method: 'GET' })
  },

  get: (id: string) =>
    Api.request<ApiData>({ url: `/stickers/${id}`, method: 'GET' }),

  create: (body: {
    name: string
    category?: string
    subcategory?: string
    tags?: string[]
    pages: object[]
    description?: string
  }) =>
    Api.request<ApiData>({ url: '/stickers', method: 'POST', data: body }),

  update: (id: string, body: { name?: string; category?: string; subcategory?: string; description?: string }) =>
    Api.request<ApiData>({ url: `/stickers/${id}`, method: 'PATCH', data: body }),

  savePages: (id: string, pages: object[]) =>
    Api.request<ApiData>({ url: `/stickers/${id}/pages`, method: 'PUT', data: { pages } }),

  publish: (id: string, isPublished: boolean) =>
    Api.request<ApiData>({
      url: `/stickers/${id}/publish`,
      method: 'PATCH',
      data: { isPublished },
    }),

  delete: (id: string) =>
    Api.request<ApiData>({ url: `/stickers/${id}`, method: 'DELETE' }),
}

// ── Main Categories (top-level content types) API ────────
export const mainCategoryApi = {
  list: () =>
    Api.request<ApiData>({ url: '/main-categories', method: 'GET' }),

  get: (id: string) =>
    Api.request<ApiData>({ url: `/main-categories/${id}`, method: 'GET' }),

  create: (body: {
    name: string
    slug?: string
    icon?: string
    color?: string
    order?: number
  }) =>
    Api.request<ApiData>({ url: '/main-categories', method: 'POST', data: body }),

  update: (id: string, body: {
    name?: string
    slug?: string
    icon?: string
    color?: string
    order?: number
  }) =>
    Api.request<ApiData>({ url: `/main-categories/${id}`, method: 'PATCH', data: body }),

  /** Deletes the main category AND all its sub-categories */
  delete: (id: string) =>
    Api.request<ApiData>({ url: `/main-categories/${id}`, method: 'DELETE' }),
}

// ── Sub-Categories (nested under a main category) API ────
export const categoryApi = {
  /** List sub-categories, optionally filtered by the parent main-category slug (itemType) */
  list: (itemType?: string) =>
    Api.request<ApiData>({
      url: `/categories${itemType ? `?itemType=${itemType}` : ''}`,
      method: 'GET',
    }),

  get: (id: string) =>
    Api.request<ApiData>({ url: `/categories/${id}`, method: 'GET' }),

  create: (body: {
    name: string
    slug?: string
    icon?: string
    color?: string
    itemType: string   // slug of the parent main category
    subcategories?: { name: string; slug?: string }[]
    order?: number
  }) =>
    Api.request<ApiData>({ url: '/categories', method: 'POST', data: body }),

  update: (id: string, body: {
    name?: string
    slug?: string
    icon?: string
    color?: string
    subcategories?: { name: string; slug?: string }[]
    order?: number
  }) =>
    Api.request<ApiData>({ url: `/categories/${id}`, method: 'PATCH', data: body }),

  addSubcategory: (id: string, sub: { name: string; slug?: string }) =>
    Api.request<ApiData>({ url: `/categories/${id}/subcategories`, method: 'POST', data: sub }),

  removeSubcategory: (id: string, slug: string) =>
    Api.request<ApiData>({ url: `/categories/${id}/subcategories/${slug}`, method: 'DELETE' }),

  delete: (id: string) =>
    Api.request<ApiData>({ url: `/categories/${id}`, method: 'DELETE' }),
}

export const pdfApi = {
  importPdf: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return Api.request<ApiData>({
      url:     '/pdf/decompose',
      method:  'POST',
      data:    form,
      // Don't set Content-Type - let axios set it with the boundary for FormData
    })
  },
}

// ── Permission Management API ────────────────────────────
export const permissionApi = {
  list: (scope?: string) =>
    Api.request<ApiData>({
      url: `/permissions${scope ? `?scope=${scope}` : ''}`,
      method: 'GET',
    }),

  get: (scope: string, targetType: string) =>
    Api.request<ApiData>({
      url: `/permissions/${scope}/${targetType}`,
      method: 'GET',
    }),

  upsert: (body: {
    scope: string
    targetType: string
    enabled: boolean
    placementRole?: 'primary' | 'secondary' | null
    allowedCategories?: string[]
    allowedItems?: string[]
  }) =>
    Api.request<ApiData>({ url: '/permissions', method: 'PUT', data: body }),

  bulkUpsert: (permissions: Array<{
    scope: string
    targetType: string
    enabled: boolean
    placementRole?: 'primary' | 'secondary' | null
    allowedCategories?: string[]
    allowedItems?: string[]
  }>) =>
    Api.request<ApiData>({ url: '/permissions/bulk', method: 'PUT', data: { permissions } }),

  delete: (scope: string, targetType: string) =>
    Api.request<ApiData>({ url: `/permissions/${scope}/${targetType}`, method: 'DELETE' }),
}

// ── User Management API ──────────────────────────────────
export const userApi = {
  // Admin users
  listAdminUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.page)   q.set('page',   String(params.page))
    if (params?.limit)  q.set('limit',  String(params.limit))
    if (params?.search) q.set('search', params.search)
    const qs = q.toString()
    return Api.request<ApiData>({ url: `/users/admin${qs ? `?${qs}` : ''}`, method: 'GET' })
  },
  createAdminUser: (body: { name: string; email: string; password: string; role?: string }) =>
    Api.request<ApiData>({ url: '/users/admin', method: 'POST', data: body }),
  updateAdminUserRole: (id: string, role: string) =>
    Api.request<ApiData>({ url: `/users/admin/${id}/role`, method: 'PATCH', data: { role } }),
  toggleAdminUserBan: (id: string) =>
    Api.request<ApiData>({ url: `/users/admin/${id}/ban`, method: 'PATCH' }),
  resetAdminUserPassword: (id: string, newPassword: string) =>
    Api.request<ApiData>({ url: `/users/admin/${id}/password`, method: 'PATCH', data: { newPassword } }),
  deleteAdminUser: (id: string) =>
    Api.request<ApiData>({ url: `/users/admin/${id}`, method: 'DELETE' }),
  deleteAdminUsers: (ids: string[]) =>
    Api.request<ApiData>({ url: '/users/admin/bulk', method: 'DELETE', data: { ids } }),

  // App users
  listAppUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.page)   q.set('page',   String(params.page))
    if (params?.limit)  q.set('limit',  String(params.limit))
    if (params?.search) q.set('search', params.search)
    const qs = q.toString()
    return Api.request<ApiData>({ url: `/users/app${qs ? `?${qs}` : ''}`, method: 'GET' })
  },
  createAppUser: (body: { name: string; email: string; password: string }) =>
    Api.request<ApiData>({ url: '/users/app', method: 'POST', data: body }),
  toggleAppUserBan: (id: string) =>
    Api.request<ApiData>({ url: `/users/app/${id}/ban`, method: 'PATCH' }),
  resetAppUserPassword: (id: string, newPassword: string) =>
    Api.request<ApiData>({ url: `/users/app/${id}/password`, method: 'PATCH', data: { newPassword } }),
  deleteAppUser: (id: string) =>
    Api.request<ApiData>({ url: `/users/app/${id}`, method: 'DELETE' }),
  deleteAppUsers: (ids: string[]) =>
    Api.request<ApiData>({ url: '/users/app/bulk', method: 'DELETE', data: { ids } }),
}
