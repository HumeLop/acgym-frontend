import { Component, computed, effect, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AuthService } from '@features/auth/services/auth-service'
import { PaymentService } from '@features/payments/services/payment-service'
import { DateUtils } from '@shared/utils/date.utils'
import { TuiButton, TuiIcon, TuiLink } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiBlockStatus, TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-payment-details',
  imports: [RouterLink, TuiIcon, TuiLink, TuiSurface, TuiSkeleton, TuiBlockStatus, TuiButton],
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
}
