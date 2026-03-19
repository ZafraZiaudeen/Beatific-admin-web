import ContentApi from '../api/contentApi'
import type { ContentItem, ContentListResponse } from '../api/types'

class ContentService {
  static async list(params?: {
    itemType?: string
    search?: string
    category?: string
    subcategory?: string
  }): Promise<ContentListResponse> {
    return ContentApi.list(params)
  }

  static async get(id: string): Promise<{ data: ContentItem }> {
    return ContentApi.get(id)
  }

  static async create(body: {
    name: string
    itemType: string
    category?: string
    subcategory?: string
    tags?: string[]
    pages: object[]
    description?: string
    svgContent?: string
  }) {
    return ContentApi.create(body)
  }

  static async update(id: string, body: {
    name?: string
    category?: string
    subcategory?: string
    description?: string
    coverImageUrl?: string
  }) {
    return ContentApi.update(id, body)
  }

  static async savePages(id: string, pages: object[], svgContent?: string) {
    return ContentApi.savePages(id, pages, svgContent)
  }

  static async publish(id: string, isPublished: boolean) {
    return ContentApi.publish(id, isPublished)
  }

  static async delete(id: string, preserveForUsers?: boolean) {
    return ContentApi.delete(id, preserveForUsers)
  }

  static async stats() {
    return ContentApi.stats()
  }
}

export default ContentService
