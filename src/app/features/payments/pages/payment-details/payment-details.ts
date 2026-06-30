import { Component, computed, effect, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { PaymentService } from '@features/payments/services/payment-service'
import { DateUtils } from '@shared/utils/date.utils'
import { TuiItem } from '@taiga-ui/cdk'
import { TuiButton, TuiIcon, TuiLink } from '@taiga-ui/core'
import { TuiBreadcrumbs, TuiSkeleton } from '@taiga-ui/kit'
import { TuiBlockStatus, TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-payment-details',
  imports: [RouterLink, TuiIcon, TuiBreadcrumbs, TuiLink, TuiItem, TuiSurface, TuiSkeleton, TuiBlockStatus, TuiButton],
  templateUrl: './payment-details.html',
})
export class PaymentDetails {
  private paymentService = inject(PaymentService)

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
}
