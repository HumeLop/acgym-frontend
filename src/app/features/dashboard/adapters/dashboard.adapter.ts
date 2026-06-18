import type {
  DashboardStatsEntity,
  MonthlyIncomeEntity,
  PaymentMethodsStatsEntity,
} from '../models/dashboard.entity'

import type {
  DashboardStats,
  MonthlyIncome,
  PaymentMethodsStats,
} from '../models/dashboard.model'

export function toDashboardStats(entity: DashboardStatsEntity): DashboardStats {
  return {
    totalMembers: entity.total_members,
    activeMembers: entity.active_members,
    inactiveMembers: entity.inactive_members,
    expiringMembers: entity.expiring_members,
    monthlyIncome: entity.monthly_income,
    paymentsThisMonth: entity.payments_this_month,
  }
}

export function toMonthlyIncome(entity: MonthlyIncomeEntity): MonthlyIncome {
  return {
    labels: entity.labels,
    income: entity.income,
    paymentsCount: entity.payments_count,
    period: entity.period,
  }
}

export function toPaymentMethodsStats(entity: PaymentMethodsStatsEntity): PaymentMethodsStats {
  return {
    labels: entity.labels,
    totals: entity.totals,
    counts: entity.counts,
    message: entity.message,
  }
}
