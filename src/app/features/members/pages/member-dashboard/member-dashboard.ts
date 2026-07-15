import { Component, computed, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { MemberForm } from '@features/members/pages/member-form/member-form'
import { MemberService } from '@features/members/services/member-service'
import {
  TuiResponsiveDialog,
} from '@taiga-ui/addon-mobile'
import { TuiIcon } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-member-dashboard',
  imports: [RouterLink, TuiResponsiveDialog, TuiIcon, TuiSurface, TuiSkeleton, MemberForm],
  templateUrl: './member-dashboard.html',
})
export class MemberDashboard {
  protected memberService = inject(MemberService)

  protected loading = this.memberService.isLoading

  protected statValues = computed(() => ({
    totalMembers: this.memberService.totalMembers(),
    expiringCount: this.memberService.hasExpiringResults(),
  }))
}
