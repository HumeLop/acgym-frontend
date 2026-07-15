import { Component, input, output, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import type { MembershipType } from '@features/admin/models/membership-type.model'
import { hapticLight } from '@shared/utils/haptic'
import { TuiRipple, TuiTouchable } from '@taiga-ui/addon-mobile'
import { TuiSwipe, type TuiSwipeEvent } from '@taiga-ui/cdk'
import { TuiIcon } from '@taiga-ui/core'
import { TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-admin-membership-type-card',
  imports: [RouterLink, TuiSwipe, TuiIcon, TuiSurface, TuiTouchable, TuiRipple],
  templateUrl: './membership-type-card.html',
})
export class AdminMembershipTypeCard {
  type = input.required<MembershipType>()

  edit = output<number>()
  delete = output<number>()

  protected swiped = signal(false)
  protected readonly actionsWidth = 144

  protected onSwipe(event: TuiSwipeEvent) {
    if (event.direction === 'left') {
      this.swiped.set(true)
      hapticLight()
    } else if (event.direction === 'right') {
      this.swiped.set(false)
    }
  }

  protected closeSwipe() {
    this.swiped.set(false)
  }

  formatCurrency(amount: string): string {
    const num = Number.parseFloat(amount)
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }
}
