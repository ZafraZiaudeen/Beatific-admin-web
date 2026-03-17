import MediaApi from './mediaApi'
import { MainCategoryApi, CategoryApi } from './categoryApi'
import PermissionApi from './permissionApi'

export const mediaApi = MediaApi

export const pdfApi = {
  importPdf: MediaApi.importPdf,
}

export const mainCategoryApi = MainCategoryApi
export const categoryApi = CategoryApi
export const permissionApi = PermissionApi
