export interface DashboardStatsEntity {
  total_members: number
  active_members: number
  inactive_members: number
  expiring_soon: number
  total_revenue: string
  average_spent_per_member: string
}

export interface MonthlyIncomeEntity {
  labels: string[]
  income: number[]
  payments_count: number[]
  period: string
}

export interface PaymentMethodsStatsEntity {
  labels: string[]
  totals: number[]
  counts: number[]
  message?: string
}
