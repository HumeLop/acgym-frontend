import { KeyValuePipe } from '@angular/common'
import { Component, effect, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { PaymentForm } from '@features/payments/pages/payment-form/payment-form'
import { PaymentService } from '@features/payments/services/payment-service'
import { WA_IS_ANDROID, WA_IS_IOS } from '@ng-web-apis/platform'
import {
  TUI_ANDROID_LOADER,
  TUI_PULL_TO_REFRESH_COMPONENT,
  TUI_PULL_TO_REFRESH_LOADED,
  TUI_PULL_TO_REFRESH_THRESHOLD,
  TuiPullToRefresh,
  TuiResponsiveDialog,
  TuiRipple,
} from '@taiga-ui/addon-mobile'
import { TuiIcon } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiSurface } from '@taiga-ui/layout'
import { Subject } from 'rxjs'

@Component({
  selector: 'app-payment-dashboard',
  imports: [
    RouterLink,
    TuiResponsiveDialog,
    TuiIcon,
    TuiSurface,
    TuiSkeleton,
    KeyValuePipe,
    PaymentForm,
    TuiPullToRefresh,
    TuiRipple,
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
  templateUrl: './payment-dashboard.html',
})
export class PaymentDashboard {
  protected paymentService = inject(PaymentService)
  private readonly isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  protected stats = this.paymentService.paymentStats
  protected loading = this.paymentService.isLoadingStats
  protected isModalOpen = this.paymentService.isModalOpen
  protected isEditingPayment = this.paymentService.editingPaymentId

  private readonly loaded$ = inject<Subject<void>>(TUI_PULL_TO_REFRESH_LOADED)
  private readonly isPulling = signal(false)

  constructor() {
    effect(() => {
      if (this.isPulling() && !this.loading()) {
        this.loaded$.next()
        this.isPulling.set(false)
      }
    })
  }

  protected onPull() {
    if (window.scrollY > 0) return
    if (!this.isTouchDevice) return
    this.paymentService.reload()
    this.isPulling.set(true)
  }
}
