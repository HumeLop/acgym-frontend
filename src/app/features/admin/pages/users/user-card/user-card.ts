import { Component, computed, input, output, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import type { User } from '@features/admin/models/user.model'
import { hapticLight } from '@shared/utils/haptic'
import { TuiRipple, TuiTouchable } from '@taiga-ui/addon-mobile'
import { TuiSwipe, type TuiSwipeEvent } from '@taiga-ui/cdk'
import { TuiIcon } from '@taiga-ui/core'
import { TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-admin-user-card',
  imports: [RouterLink, TuiSwipe, TuiIcon, TuiSurface, TuiTouchable, TuiRipple],
  templateUrl: './user-card.html',
})
export class AdminUserCard {
  user = input.required<User>()

  edit = output<number>()
  delete = output<number>()

  protected swiped = signal(false)
  protected readonly actionsWidth = 144

  protected displayName = computed(() => {
    const u = this.user()
    if (u.firstName || u.lastName) return `${u.firstName} ${u.lastName}`.trim()
    return u.username
  })

  protected roleLabel = computed(() => {
    const labels: Record<string, string> = {
      admin: 'Admin',
      receptionist: 'Recepcionista',
    }
    return labels[this.user().role] ?? this.user().role
  })

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
}
