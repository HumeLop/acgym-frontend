import type { PaginationParams } from '@shared/models/pagination'

export interface MemberFilterParams extends PaginationParams {
  search?: string
  isActive?: boolean
  inactiveSinceDays?: number
}
