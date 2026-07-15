import { Component, inject } from '@angular/core'
import { MemberCard } from '@features/members/pages/member-card/member-card'
import { MemberForm } from '@features/members/pages/member-form/member-form'
import { MemberService } from '@features/members/services/member-service'
import { ConfirmService } from '@shared/services/confirm-service'
import {
  TuiResponsiveDialog,
  TuiRipple,
} from '@taiga-ui/addon-mobile'
import { TuiIcon, TuiNotification } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiCardLarge } from '@taiga-ui/layout'

@Component({
  selector: 'app-expiring-members',
  imports: [
    TuiIcon,
    TuiNotification,
    TuiCardLarge,
    MemberCard,
    MemberForm,
    TuiResponsiveDialog,
    TuiRipple,
    TuiSkeleton,
  ],
  templateUrl: './expiring-members.html',
})
export class ExpiringMembers {
  protected memberService = inject(MemberService)
  private readonly confirmSvc = inject(ConfirmService)

  protected members = this.memberService.expiringMembers
  protected hasMembers = this.memberService.hasExpiringMembers
  protected isLoading = this.memberService.isLoading
  protected isDeleting = this.memberService.isDeleting
  protected error = this.memberService.error
  protected searchTerm = this.memberService.searchTerm

  isModalOpen = this.memberService.isModalOpen
  isEditingMember = this.memberService.editingMemberId

  protected onSearch(value: string) {
    this.memberService.search(value)
  }

  protected onClearSearch() {
    this.memberService.search('')
  }

  onDeleteMember(id: number) {
    this.confirmSvc
      .open({
        title: 'Eliminar miembro',
        message: '¿Estás seguro de eliminar a este miembro?',
        type: 'destructive',
        confirmText: 'Eliminar',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.memberService.deletingMemberId.set(id)
          this.memberService.deleteMember(id).subscribe()
        }
      })
  }

  closeModal() {
    this.memberService.closeModal()
  }
}
