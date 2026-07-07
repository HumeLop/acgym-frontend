import { Component, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { MemberForm } from '@features/members/pages/member-form/member-form'
import { MemberService } from '@features/members/services/member-service'
import { TuiResponsiveDialog } from '@taiga-ui/addon-mobile'
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

  protected total = this.memberService.totalMembers
  protected loading = this.memberService.isLoading
  protected isModalOpen = this.memberService.isModalOpen
  protected isEditingMember = this.memberService.editingMemberId
}
