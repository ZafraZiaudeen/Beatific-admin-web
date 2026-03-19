import TemplateApi from '../api/templateApi'
import type { TemplateItem } from '../api/types'

class TemplateService {
  static async list(params?: {
    search?: string
    category?: string
    subcategory?: string
  }): Promise<{ data: TemplateItem[] }> {
    return TemplateApi.list(params)
  }

  static async get(id: string): Promise<{ data: TemplateItem }> {
    return TemplateApi.get(id)
  }

  static async create(body: {
    name: string
    category?: string
    subcategory?: string
    tags?: string[]
    pages: object[]
    description?: string
  }) {
    return TemplateApi.create(body)
  }

  static async update(id: string, body: {
    name?: string
    category?: string
    subcategory?: string
    description?: string
  }) {
    return TemplateApi.update(id, body)
  }

  static async savePages(id: string, pages: object[]) {
    return TemplateApi.savePages(id, pages)
  }

  static async publish(id: string, isPublished: boolean) {
    return TemplateApi.publish(id, isPublished)
  }

  static async delete(id: string, preserveForUsers?: boolean) {
    return TemplateApi.delete(id, preserveForUsers)
  }
}

export default TemplateService
