import { Component, inject, signal } from '@angular/core'
import { MemberService } from '@app/features/members/services/member-service'
import { ConfirmationModal } from '@shared/components/confirmation-modal/confirmation-modal'
import { TuiIcon } from '@taiga-ui/core'
import { MemberCard } from '../member-card/member-card'

@Component({
  selector: 'app-inactive-members',
  imports: [TuiIcon, MemberCard, ConfirmationModal],
  templateUrl: './inactive-members.html',
  styleUrl: './inactive-members.css',
})
export class InactiveMembers {
  protected memberService = inject(MemberService)

  protected members = this.memberService.expiringMembers
  protected hasMembers = this.memberService.hasExpiringMembers
  protected isLoading = this.memberService.isLoading
  protected isDeleting = this.memberService.isDeleting
  protected error = this.memberService.error
  protected searchTerm = this.memberService.searchTerm
  protected showDeleteConfirmation = signal(false)

  protected onSearch(value: string) {
    this.memberService.search(value)
  }

  protected onClearSearch() {
    this.memberService.search('')
  }

  onDeleteMember(id: number) {
    this.memberService.deletingMemberId.set(id)
    this.showDeleteConfirmation.set(true)
  }

  protected onConfirmDelete() {
    const id = this.memberService.deletingMemberId()
    if (id === null) return
    this.memberService.deleteMember(id).subscribe()
    this.showDeleteConfirmation.set(false)
  }

  protected onCancelDelete() {
    this.memberService.deletingMemberId.set(null)
    this.showDeleteConfirmation.set(false)
  }
}
