import { Component, computed, effect, inject, input, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { PaymentForm } from '@features/payments/pages/payment-form/payment-form'
import { PaymentService } from '@features/payments/services/payment-service'
import { WA_IS_ANDROID, WA_IS_IOS } from '@ng-web-apis/platform'
import { DateUtils } from '@shared/utils/date.utils'
import { hapticMedium } from '@shared/utils/haptic'
import {
  TUI_ANDROID_LOADER,
  TUI_PULL_TO_REFRESH_COMPONENT,
  TUI_PULL_TO_REFRESH_LOADED,
  TUI_PULL_TO_REFRESH_THRESHOLD,
  TuiPullToRefresh,
  TuiResponsiveDialog,
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
    TuiResponsiveDialog,
    TuiIcon,
    TuiLink,
    TuiSurface,
    TuiSkeleton,
    TuiBlockStatus,
    TuiButton,
    PaymentForm,
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
  protected paymentService = inject(PaymentService)

  id = input.required<string>({ alias: 'id' })

  protected paymentDetail = this.paymentService.paymentDetail
  protected isLoading = this.paymentService.isLoadingDetail
  protected error = this.paymentService.detailError

  private _loadEffect = effect(() => {
    const id = Number(this.id())
    if (id) this.paymentService.loadPaymentDetail(id)
  })

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

  private readonly pullEffect = effect(() => {
    if (this.isPulling() && !this.isLoading()) {
      this.loaded$.next()
      this.isPulling.set(false)
    }
  })

  protected onPull() {
    this.paymentService.paymentDetailResource.reload()
    this.isPulling.set(true)
  }

  protected onEdit() {
    hapticMedium()
    this.paymentService.openEditModal(Number(this.id()))
  }
}
