export interface MembershipTypeEntity {
  id: number
  name: string
  amount: string
  description: string
  duration_days: number
  is_active: boolean
  payments_count: number
  total_revenue: number
  created_at: string
  updated_at: string
}
