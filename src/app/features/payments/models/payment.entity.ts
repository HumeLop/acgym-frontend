import type { PaymentMethod } from '@shared/models'

export interface PaymentListEntity {
  id: number
  member: number
  member_name: string
  membership_type: number
  membership_type_name: string
  amount: string
  payment_date: string
  payment_method: PaymentMethod
  start_date: string | null
  end_date: string | null
  is_active: boolean
}

export interface PaymentStatsEntity {
  total_payments: number
  total_amount: string
  active_payments: number
  expired_payments: number
  expiring_soon: number
  by_method: Record<string, number>
  amount_by_method: Record<string, string>
  average_payment: string
}

export interface PaymentDetailEntity extends PaymentListEntity {
  member_email: string
  member_phone: string
  member_status: string
  membership_type_duration: number
  notes: string
  registered_by: number | null
  registered_by_username: string | null
  created_at: string
  updated_at: string
  days_remaining: number
  is_expiring_soon: boolean
  status_color: string
}
