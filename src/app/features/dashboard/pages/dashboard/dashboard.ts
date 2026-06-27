import { CurrencyPipe } from '@angular/common'
import { Component, computed, effect, inject, signal } from '@angular/core'
import { FormField, form } from '@angular/forms/signals'
import { Router, RouterLink } from '@angular/router'
import { MemberService } from '@app/features/members/services/member-service'
import { StatsCard } from '@features/dashboard/pages/stats-card/stats-card'
import { DashboardService } from '@features/dashboard/services/dashboard-service'
import { WA_IS_ANDROID, WA_IS_IOS } from '@ng-web-apis/platform'
import { TuiAutoFocus } from '@taiga-ui/cdk'
import {
  TUI_ANDROID_LOADER,
  TUI_PULL_TO_REFRESH_COMPONENT,
  TUI_PULL_TO_REFRESH_LOADED,
  TuiPullToRefresh,
} from '@taiga-ui/addon-mobile'
import { TuiButton, TuiIcon, TuiNotification } from '@taiga-ui/core'
import { TuiProgress } from '@taiga-ui/kit'
import { TuiCardLarge } from '@taiga-ui/layout'
import type { EChartsOption } from 'echarts'
import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts'
import { Subject } from 'rxjs'

echarts.use([BarChart, PieChart, GridComponent, TooltipComponent, CanvasRenderer])

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    TuiIcon,
    TuiButton,
    TuiNotification,
    TuiProgress,
    CurrencyPipe,
    StatsCard,
    NgxEchartsDirective,
    FormField,
    TuiPullToRefresh,
    TuiCardLarge,
    TuiAutoFocus,
  ],
  providers: [
    provideEchartsCore({ echarts }),
    {
      provide: TUI_PULL_TO_REFRESH_LOADED,
      useClass: Subject,
    },
    {
      provide: TUI_PULL_TO_REFRESH_COMPONENT,
      useValue: TUI_ANDROID_LOADER,
    },
    {
      provide: WA_IS_ANDROID,
      useValue: true,
    },
    {
      provide: WA_IS_IOS,
      useValue: false,
    },
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private dashboardService = inject(DashboardService)
  private memberService = inject(MemberService)
  private router = inject(Router)

  protected dashboardStats = this.dashboardService.dashboardStats
  protected paymentMethodsData = this.dashboardService.paymentMethodsList

  protected activeMembers = computed(() => this.dashboardStats()?.activeMembers ?? 0)
  protected totalMembers = computed(() => this.dashboardStats()?.totalMembers ?? 0)
  protected inactiveMembersCount = computed(() => this.dashboardStats()?.inactiveMembers ?? 0)
  protected expiringMembers = computed(() => this.dashboardStats()?.expiringMembers ?? 0)
  protected paymentsThisMonth = this.dashboardService.paymentsCountTotal
  protected monthlyIncome = this.dashboardService.monthlyIncomeTotal

  protected searchModel = signal({ days: 30 })
  protected searchForm = form(this.searchModel)
  protected inactiveMembers = this.memberService.inactiveMembers
  protected inactiveSearchLoading = this.memberService.inactiveSearchLoading
  protected inactiveSearchError = this.memberService.inactiveSearchError
  protected showInactiveResults = this.memberService.showInactiveResults

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

  protected searchInactive() {
    this.memberService.searchInactive(this.searchModel().days)
  }

  protected clearInactiveMembers() {
    this.memberService.clearInactiveMembers()
  }

  protected goToExpiring() {
    this.router.navigate(['/members', 'expiring-memberships'])
  }

  private readonly loaded$ = inject<Subject<void>>(TUI_PULL_TO_REFRESH_LOADED)
  private readonly isPulling = signal(false)

  private readonly pullEffect = effect(() => {
    if (this.isPulling() && !this.dashboardService.isLoading()) {
      this.loaded$.next()
      this.isPulling.set(false)
    }
  })

  protected onPull() {
    this.dashboardService.reload()
    this.isPulling.set(true)
  }
}
