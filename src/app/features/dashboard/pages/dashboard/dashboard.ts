import { CurrencyPipe } from '@angular/common'
import { Component, computed, inject } from '@angular/core'
import { MatIcon } from '@angular/material/icon'
import { StatsCard } from '@features/dashboard/pages/stats-card/stats-card'
import { DashboardService } from '@features/dashboard/services/dashboard-service'
import type { EChartsOption } from 'echarts'
import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts'

echarts.use([BarChart, PieChart, GridComponent, TooltipComponent, CanvasRenderer])

@Component({
  selector: 'app-dashboard',
  imports: [MatIcon, CurrencyPipe, StatsCard, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private dashboardService = inject(DashboardService)
  protected dashboardStats = this.dashboardService.dashboardStats
  protected paymentMethodsData = this.dashboardService.paymentMethodsList

  protected activeMembers = computed(() => this.dashboardStats()?.activeMembers ?? 0)
  protected totalMembers = computed(() => this.dashboardStats()?.totalMembers ?? 0)
  protected inactiveMembersCount = computed(() => this.dashboardStats()?.inactiveMembers ?? 0)
  protected expiringMembers = computed(() => this.dashboardStats()?.expiringMembers ?? 0)
  protected paymentsThisMonth = this.dashboardService.paymentsCountTotal
  protected monthlyIncome = this.dashboardService.monthlyIncomeTotal

  protected monthlyIncomeChartOptions = computed(() => {
    const data = this.dashboardService.monthlyIncome()
    if (!data) return undefined
    return {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: data.labels,
        axisLabel: { rotate: data.labels.length > 4 ? 45 : 0, fontSize: 11 },
        axisLine: { lineStyle: { color: '#9ca3af' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 11 },
        splitLine: { lineStyle: { color: '#374151', opacity: 0.3 } },
      },
      series: [
        {
          type: 'bar',
          data: data.income,
          itemStyle: { color: '#ea580c', borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 100,
        },
      ],
      grid: { left: 36, right: 8, top: 12, bottom: 28 },
    } satisfies EChartsOption
  })

  protected paymentMethodsChartOptions = computed(() => {
    const data = this.dashboardService.paymentMethods()
    if (!data) return undefined
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c}' },
      series: [
        {
          type: 'pie',
          radius: ['50%', '70%'],
          center: ['50%', '50%'],
          data: data.labels.map((label, i) => ({
            name: label,
            value: data.totals[i] ?? 0,
          })),
          itemStyle: { borderRadius: 4 },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' },
          },
        },
      ],
    } satisfies EChartsOption
  })

  protected currentDate = computed(() => {
    return new Date().toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
    })
  })
}
