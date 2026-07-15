import { Component, computed, inject, input, output } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from '@features/auth/services/auth-service'
import type { Member } from '@features/members/models'
import { TuiSwipeActions, TuiSwipeActionsAutoClose } from '@taiga-ui/addon-mobile'
import { TuiButton, TuiIcon } from '@taiga-ui/core'
import { TuiProgress } from '@taiga-ui/kit'
import { TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-member-card',
  imports: [TuiSwipeActions, TuiSwipeActionsAutoClose, TuiIcon, TuiButton, TuiSurface, TuiProgress],
  templateUrl: './member-card.html',
  styleUrl: './member-card.css',
})
export class MemberCard {
  member = input.required<Member>()
  private authService = inject(AuthService)
  private router = inject(Router)

  protected isAdmin = this.authService.isAdmin

  edit = output<number>()
  delete = output<number>()
  renew = output<number>()

  goToMemberDetail(id: number) {
    this.router.navigate(['/members', id])
  }

  protected readonly progressValue = computed(() => {
    const days = this.member().daysUntilExpiration
    if (days === null) return 0
    return Math.min(Math.max((days / 30) * 100, 0), 100)
  })

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }
}
