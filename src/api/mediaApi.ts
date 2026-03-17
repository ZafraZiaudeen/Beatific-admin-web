import Api from './api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiData = any

const MediaApi = {
  upload: (file: File): Promise<ApiData> => {
    const form = new FormData()
    form.append('file', file)
    return Api.post<ApiData>('/media/upload', form)
  },

  importPdf: (file: File): Promise<ApiData> => {
    const form = new FormData()
    form.append('file', file)
    return Api.post<ApiData>('/pdf/decompose', form)
  },
}

export default MediaApi
