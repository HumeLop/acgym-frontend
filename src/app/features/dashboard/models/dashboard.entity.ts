export interface DashboardStatsEntity {
  total_members: number
  active_members: number
  inactive_members: number
  expiring_members: number
  monthly_income: number
  payments_this_month: number
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
  message: string
}


