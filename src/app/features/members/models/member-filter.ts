import type { PaginationParams } from '@shared/models/pagination'

export interface MemberFilterParams extends PaginationParams {
  search?: string
  isActive?: boolean
  inactive_since_days?: number
  days_until_expiration?: number
}
