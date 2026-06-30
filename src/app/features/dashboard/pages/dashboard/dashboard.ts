import { CurrencyPipe } from '@angular/common'
import { Component, computed, effect, inject, signal } from '@angular/core'
import { FormField, form } from '@angular/forms/signals'
import { Router, RouterLink } from '@angular/router'
import { MemberService } from '@app/features/members/services/member-service'
import { StatsCard } from '@features/dashboard/pages/stats-card/stats-card'
import { DashboardService } from '@features/dashboard/services/dashboard-service'
import { WA_IS_ANDROID, WA_IS_IOS } from '@ng-web-apis/platform'
import { TuiAxes, TuiBarChart, TuiChartHint, TuiLegendItem, TuiRingChart } from '@taiga-ui/addon-charts'
import {
  TUI_ANDROID_LOADER,
  TUI_PULL_TO_REFRESH_COMPONENT,
  TUI_PULL_TO_REFRESH_LOADED,
  TuiElasticSticky,
  TuiPullToRefresh,
} from '@taiga-ui/addon-mobile'
import { type TuiContext, TuiHovered, tuiClamp } from '@taiga-ui/cdk'
import { TuiAppearance, TuiButton, TuiIcon, TuiNotification } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiBlockStatus, TuiSurface } from '@taiga-ui/layout'
import { Subject } from 'rxjs'

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    TuiIcon,
    TuiButton,
    TuiNotification,
    CurrencyPipe,
    StatsCard,
    FormField,
    TuiPullToRefresh,
    TuiRingChart,
    TuiLegendItem,
    TuiAxes,
    TuiBarChart,
    TuiChartHint,
    TuiSkeleton,
    TuiHovered,
    TuiBlockStatus,
    TuiSurface,
    TuiAppearance,
    TuiElasticSticky,
  ],
  providers: [
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
  protected dashboardError = this.dashboardService.error

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

  // Ring chart (payment methods)
  protected activeRingIndex = signal(NaN)

  protected ringChartValues = computed(() => this.paymentMethodsData().map((m) => m.total))

  protected ringChartTotal = computed(() => this.ringChartValues().reduce((a, b) => a + b, 0))

  // Bar chart (monthly income)
  protected incomeLabels = computed(() => this.dashboardService.monthlyIncome()?.labels ?? [])

  protected incomeValues = computed(() => this.dashboardService.monthlyIncome()?.income ?? [])

  protected incomeMax = computed(() => {
    const vals = this.incomeValues()
    return vals.length ? Math.max(...vals) * 1.15 : 0
  })

  protected incomeYLabels = computed(() => {
    const max = this.incomeMax()
    const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-MX')}`
    return ['$0', max > 0 ? fmt(max / 2) : '', fmt(max)]
  })

  protected incomeHint = ({ $implicit }: TuiContext<number>): string => {
    const val = this.incomeValues()[$implicit] ?? 0
    return `$${Math.round(val).toLocaleString('es-MX')}`
  }

  // Skeleton loading
  protected isInitialLoading = computed(() => this.dashboardService.isLoading() && !this.dashboardStats())

  // Elastic sticky header
  protected headerScale = signal(1)

  protected onElastic(scale: number): void {
    this.headerScale.set(tuiClamp(scale, 0.6, 1))
  }

  protected onLegendHover(index: number, hovered: boolean): void {
    this.activeRingIndex.set(hovered ? index : NaN)
  }

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

  protected goToMembers() {
    this.router.navigate(['/members'])
  }

  protected goToPayments() {
    this.router.navigate(['/payments'])
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

  protected reloadAll() {
    this.dashboardService.reload()
  }
}
