import type { UserEntity } from '@features/admin/models/user.entity'
import type { User } from '@features/admin/models/user.model'

export function toUser(entity: UserEntity): User {
  return {
    id: entity.id,
    username: entity.username,
    email: entity.email,
    firstName: entity.first_name,
    lastName: entity.last_name,
    role: entity.role,
  }
}

export function toUserDetail(entity: UserEntity): User {
  return toUser(entity)
}
