import { Component, computed, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AuthService } from '@features/auth/services/auth-service'
import type { Payment } from '@features/payments/models'
import { DateUtils } from '@shared/utils'
import { TuiRipple } from '@taiga-ui/addon-mobile'
import { TuiIcon } from '@taiga-ui/core'
import { TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-payment-card',
  imports: [RouterLink, TuiIcon, TuiSurface, TuiRipple],
  templateUrl: './payment-card.html',
})
export class PaymentCard {
  item = input.required<Payment>()

  private authService = inject(AuthService)
  protected isAdmin = this.authService.isAdmin

  protected initial = computed(() => {
    return this.item()
      .memberName.split(' ')
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  })

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—'
    return DateUtils.formatDateForDisplay(DateUtils.parseDateString(dateStr))
  }
}
