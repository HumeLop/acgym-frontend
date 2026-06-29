import { Component, computed, input, output, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import type { Payment } from '@features/payments/models'
import { DateUtils } from '@shared/utils'
import { TuiSwipe, type TuiSwipeEvent } from '@taiga-ui/cdk'
import { TuiButton, TuiIcon } from '@taiga-ui/core'
import { TuiCardLarge } from '@taiga-ui/layout'

@Component({
  selector: 'app-payment-card',
  imports: [RouterLink, TuiIcon, TuiButton, TuiSwipe, TuiCardLarge],
  templateUrl: './payment-card.html',
  styleUrl: './payment-card.css',
})
export class PaymentCard {
  item = input.required<Payment>()
  isDeleting = input(false)
  isAdmin = input(false)

  viewDetail = output<Payment>()
  edit = output<Payment>()
  delete = output<Payment>()

  protected swiped = signal(false)
  protected readonly actionsWidth = 144

  protected onSwipe(event: TuiSwipeEvent) {
    if (event.direction === 'left') {
      this.swiped.set(true)
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
