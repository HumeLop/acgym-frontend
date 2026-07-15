export interface DashboardStats {
  totalMembers: number
  activeMembers: number
  inactiveMembers: number
  expiringMembers: number
  totalRevenue: string
  averageSpentPerMember: string
}

export interface MonthlyIncome {
  labels: string[]
  income: number[]
  paymentsCount: number[]
  period: string
}

export interface PaymentMethodsStats {
  labels: string[]
  totals: number[]
  counts: number[]
  message?: string
}
