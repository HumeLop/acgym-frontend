import { Component, computed, inject, input, output, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AuthService } from '@features/auth/services/auth-service'
import type { Payment } from '@features/payments/models'
import { DateUtils } from '@shared/utils'
import { hapticLight } from '@shared/utils/haptic'
import { TuiRipple, TuiTouchable } from '@taiga-ui/addon-mobile'
import { TuiSwipe, type TuiSwipeEvent } from '@taiga-ui/cdk'
import { TuiIcon } from '@taiga-ui/core'
import { TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-payment-card',
  imports: [RouterLink, TuiIcon, TuiSwipe, TuiSurface, TuiTouchable, TuiRipple],
  templateUrl: './payment-card.html',
})
export class PaymentCard {
  item = input.required<Payment>()
  isDeleting = input(false)

  edit = output<Payment>()
  delete = output<Payment>()

  private authService = inject(AuthService)
  protected isAdmin = this.authService.isAdmin

  protected swiped = signal(false)
  protected readonly actionsWidth = computed(() => (this.isAdmin() ? 144 : 72))

  protected onSwipe(event: TuiSwipeEvent) {
    if (event.direction === 'left') {
      this.swiped.set(true)
      hapticLight()
    } else if (event.direction === 'right') {
      this.swiped.set(false)
    }
  }

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

  protected closeSwipe() {
    this.swiped.set(false)
  }
}
