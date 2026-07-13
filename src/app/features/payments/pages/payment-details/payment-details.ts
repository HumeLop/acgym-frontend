import { Component, computed, effect, inject, input, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AuthService } from '@features/auth/services/auth-service'
import { PaymentService } from '@features/payments/services/payment-service'
import { WA_IS_ANDROID, WA_IS_IOS } from '@ng-web-apis/platform'
import { DateUtils } from '@shared/utils/date.utils'
import {
  TUI_ANDROID_LOADER,
  TUI_PULL_TO_REFRESH_COMPONENT,
  TUI_PULL_TO_REFRESH_LOADED,
  TUI_PULL_TO_REFRESH_THRESHOLD,
  TuiPullToRefresh,
} from '@taiga-ui/addon-mobile'
import { TuiButton, TuiIcon, TuiLink } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiBlockStatus, TuiSurface } from '@taiga-ui/layout'
import { Subject } from 'rxjs'

@Component({
  selector: 'app-payment-details',
  imports: [
    RouterLink,
    TuiPullToRefresh,
    TuiIcon,
    TuiLink,
    TuiSurface,
    TuiSkeleton,
    TuiBlockStatus,
    TuiButton,
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
      useValue: true,
    },
    {
      provide: TUI_PULL_TO_REFRESH_THRESHOLD,
      useValue: 120,
    },
  ],
  templateUrl: './payment-details.html',
})
export class PaymentDetails {
  private paymentService = inject(PaymentService)
  private authService = inject(AuthService)

  protected isAdmin = this.authService.isAdmin

  id = input.required<string>({ alias: 'id' })

  protected paymentDetail = this.paymentService.paymentDetail
  protected isLoading = this.paymentService.isLoadingDetail
  protected error = this.paymentService.detailError

  constructor() {
    effect(() => {
      const id = Number(this.id())
      if (id) this.paymentService.loadPaymentDetail(id)
    })

    effect(() => {
      if (this.isPulling() && !this.isLoading()) {
        this.loaded$.next()
        this.isPulling.set(false)
      }
    })
  }

  protected statusLabel = computed(() => {
    const p = this.paymentDetail()
    if (!p) return 'Desconocido'
    if (p.isExpiringSoon) return 'Por vencer'
    return p.isActive ? 'Activo' : 'Inactivo'
  })

  protected displayDate(dateStr: string | null): string {
    if (!dateStr) return '—'
    const parsed = DateUtils.parseDateString(dateStr)
    return parsed ? DateUtils.formatDateForDisplay(parsed) : '—'
  }

  protected isExpiringSoon = computed(() => {
    const p = this.paymentDetail()
    return p ? p.isExpiringSoon : false
  })

  protected daysRemaining = computed(() => {
    const p = this.paymentDetail()
    return p?.daysRemaining ?? null
  })

  private readonly loaded$ = inject<Subject<void>>(TUI_PULL_TO_REFRESH_LOADED)
  private readonly isPulling = signal(false)

  protected onPull() {
    this.paymentService.paymentDetailResource.reload()
    this.isPulling.set(true)
  }
}
