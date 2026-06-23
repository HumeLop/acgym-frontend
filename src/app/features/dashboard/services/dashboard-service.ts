import { httpResource } from '@angular/common/http'
import { computed, Service } from '@angular/core'
import { environment } from '@environments/environment'
import { toDashboardStats, toMonthlyIncome, toPaymentMethodsStats } from '../adapters/dashboard.adapter'
import type { DashboardStatsEntity, MonthlyIncomeEntity, PaymentMethodsStatsEntity } from '../models/dashboard.entity'

@Service()
export class DashboardService {
  private apiURL = `${environment.apiURL}/dashboard`

  private statsEntityResource = httpResource<DashboardStatsEntity>(() => ({
    url: `${this.apiURL}/stats/`,
  }))

  private monthlyIncomeEntityResource = httpResource<MonthlyIncomeEntity>(() => ({
    url: `${this.apiURL}/monthly-income/`,
  }))

  private paymentMethodsEntityResource = httpResource<PaymentMethodsStatsEntity>(() => ({
    url: `${this.apiURL}/payment-methods/`,
  }))

  readonly dashboardStats = computed(() => {
    const entity = this.statsEntityResource.value()
    return entity ? toDashboardStats(entity) : undefined
  })

  readonly monthlyIncome = computed(() => {
    const entity = this.monthlyIncomeEntityResource.value()
    return entity ? toMonthlyIncome(entity) : undefined
  })

  readonly paymentMethods = computed(() => {
    const entity = this.paymentMethodsEntityResource.value()
    return entity ? toPaymentMethodsStats(entity) : undefined
  })

  readonly monthlyIncomeTotal = computed(
    () => this.monthlyIncome()?.income.reduce((a: number, b: number) => a + b, 0) ?? 0
  )

  readonly paymentsCountTotal = computed(
    () => this.monthlyIncome()?.paymentsCount.reduce((a: number, b: number) => a + b, 0) ?? 0
  )

  readonly paymentMethodsList = computed(() => {
    const data = this.paymentMethods()
    if (!data) return []
    const colorMap: Record<string, string> = {
      Efectivo: '#16a34a',
      Tarjeta: '#2563eb',
      Transferencia: '#9333ea',
    }
    const grandTotal = data.totals.reduce((a, b) => a + b, 0)
    return data.labels.map((label, i) => {
      const total = data.totals[i] ?? 0
      return {
        label,
        total,
        count: data.counts[i] ?? 0,
        color: colorMap[label] ?? '#6b7280',
        percentage: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0,
      }
    })
  })

  readonly isLoading = computed(
    () =>
      this.statsEntityResource.isLoading() ||
      this.monthlyIncomeEntityResource.isLoading() ||
      this.paymentMethodsEntityResource.isLoading()
  )

  readonly error = computed(() => {
    const statsError = this.statsEntityResource.error()
    if (statsError) return statsError

    const incomeError = this.monthlyIncomeEntityResource.error()
    if (incomeError) return incomeError

    return this.paymentMethodsEntityResource.error()
  })
}
