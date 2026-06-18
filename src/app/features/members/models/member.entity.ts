import type { MemberStatus } from '@shared/models'

export interface MemberEntity {
  id: number
  name: string
  phone: string | null
  email: string | null
  status: MemberStatus
  notifications_enabled: boolean
  created_at: string
  updated_at: string
  is_active: boolean
  active_payments_count: number
  days_until_expiration: number | null
  is_expiring_soon: boolean
}

export interface MemberStatsEntity {
  total_members: number
  active_members: number
  inactive_members: number
  expiring_soon: number
  with_phone: number
  with_email: number
  notifications_enabled: number
  total_revenue: string
  average_spent_per_member: string
}

export interface MemberDetailEntity extends MemberEntity {
  date_of_birth: string | null
  age: number
  emergency_contact: string | null
  emergency_phone: string | null
  notes: string | null
  total_paid: string | null
  last_payment_date: string | null
  payment_summary: Record<string, unknown>
  full_phone_number: string
}
