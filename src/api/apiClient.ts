import MediaApi from './mediaApi'
import type { PdfJobStatus } from './mediaApi'
import { MainCategoryApi, CategoryApi } from './categoryApi'
import PermissionApi from './permissionApi'

export const mediaApi = MediaApi

export const pdfApi = {
  importPdf: (file: File, onProgress?: (status: PdfJobStatus) => void) =>
    MediaApi.importPdf(file, onProgress),
}

export const mainCategoryApi = MainCategoryApi
export const categoryApi = CategoryApi
export const permissionApi = PermissionApi

export type { PdfJobStatus }
