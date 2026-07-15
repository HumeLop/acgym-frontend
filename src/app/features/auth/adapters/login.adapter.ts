import type { UserInfoEntity } from '@features/auth/models/login.entity'
import type { UserInfo } from '@features/auth/models/login.model'

export function toUserInfo(entity: UserInfoEntity): UserInfo {
  return {
    id: entity.id,
    username: entity.username,
    email: entity.email,
    firstName: entity.first_name,
    lastName: entity.last_name,
    role: entity.role,
  }
}
