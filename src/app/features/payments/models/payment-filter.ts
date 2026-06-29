import type { PaginationParams } from '@shared/models'

export interface PaymentFilterParams extends PaginationParams {
  memberId?: number
  startDate?: string
  endDate?: string
  status?: string
  paymentMethod?: string
}
