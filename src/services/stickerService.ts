import StickerApi from '../api/stickerApi'
import type { StickerItem } from '../api/types'

class StickerService {
  static async list(params?: {
    search?: string
    category?: string
    subcategory?: string
  }): Promise<{ data: StickerItem[] }> {
    return StickerApi.list(params)
  }

  static async get(id: string): Promise<{ data: StickerItem }> {
    return StickerApi.get(id)
  }

  static async create(body: {
    name: string
    category?: string
    subcategory?: string
    tags?: string[]
    pages: object[]
    description?: string
  }) {
    return StickerApi.create(body)
  }

  static async update(id: string, body: {
    name?: string
    category?: string
    subcategory?: string
    description?: string
  }) {
    return StickerApi.update(id, body)
  }

  static async savePages(id: string, pages: object[]) {
    return StickerApi.savePages(id, pages)
  }

  static async publish(id: string, isPublished: boolean) {
    return StickerApi.publish(id, isPublished)
  }

  static async delete(id: string) {
    return StickerApi.delete(id)
  }
}

export default StickerService
