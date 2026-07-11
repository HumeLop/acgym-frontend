import { Component, computed, input, output, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import type { Member } from '@features/members/models'
import { hapticLight } from '@shared/utils/haptic'
import { TuiRipple, TuiTouchable } from '@taiga-ui/addon-mobile'
import type { TuiSwipeEvent } from '@taiga-ui/cdk'
import { TuiSwipe } from '@taiga-ui/cdk'
import { TuiIcon } from '@taiga-ui/core'
import { TuiProgress } from '@taiga-ui/kit'
import { TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-member-card',
  imports: [RouterLink, TuiSwipe, TuiIcon, TuiSurface, TuiProgress, TuiTouchable, TuiRipple],
  templateUrl: './member-card.html',
})
export class MemberCard {
  member = input.required<Member>()

  edit = output<number>()
  delete = output<number>()

  protected swiped = signal(false)
  protected readonly actionsWidth = 144

  protected readonly progressValue = computed(() => {
    const days = this.member().daysUntilExpiration
    if (days === null) return 0
    return Math.min(Math.max((days / 30) * 100, 0), 100)
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

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }
}
