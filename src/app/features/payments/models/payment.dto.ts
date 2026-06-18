import type { PaymentMethod } from '@shared/models'

export interface PaymentWriteDto {
  member: number
  membership_type: number
  amount?: string
  payment_date?: string
  payment_method: PaymentMethod
  notes?: string
}

export interface PaymentRenewalDto {
  member: number
  membership_type: number
  payment_method: PaymentMethod
  notes?: string
}
