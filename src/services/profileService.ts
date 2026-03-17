import ProfileApi from '../api/profileApi'
import type { UpdateProfilePayload, ChangePasswordPayload } from '../api/types'

class ProfileService {
  static async updateProfile(body: UpdateProfilePayload) {
    return ProfileApi.updateProfile(body)
  }

  static async changePassword(body: ChangePasswordPayload) {
    return ProfileApi.changePassword(body)
  }

  static async uploadAvatar(file: File) {
    return ProfileApi.uploadAvatar(file)
  }

  static async fetchProfile() {
    return ProfileApi.fetchProfile()
  }
}

export default ProfileService
