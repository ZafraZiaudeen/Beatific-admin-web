import Api from './api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiData = any

export const templateApi = {
  list: (search?: string) =>
    Api.request<ApiData>({
      url: `/templates${search ? `?search=${encodeURIComponent(search)}` : ''}`,
      method: 'GET',
    }),

  get: (id: string) =>
    Api.request<ApiData>({ url: `/templates/${id}`, method: 'GET' }),

  create: (body: {
    name: string
    category?: string
    tags?: string[]
    pages: object[]
    description?: string
  }) =>
    Api.request<ApiData>({ url: '/templates', method: 'POST', data: body }),

  update: (id: string, body: { name?: string; category?: string; description?: string }) =>
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
  list: (search?: string) =>
    Api.request<ApiData>({
      url: `/stickers${search ? `?search=${encodeURIComponent(search)}` : ''}`,
      method: 'GET',
    }),

  get: (id: string) =>
    Api.request<ApiData>({ url: `/stickers/${id}`, method: 'GET' }),

  create: (body: {
    name: string
    category?: string
    tags?: string[]
    pages: object[]
    description?: string
  }) =>
    Api.request<ApiData>({ url: '/stickers', method: 'POST', data: body }),

  update: (id: string, body: { name?: string; category?: string; description?: string }) =>
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
