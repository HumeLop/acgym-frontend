import { Component, computed, inject, signal } from '@angular/core'
import { MemberCard } from '@features/members/pages/member-card/member-card'
import { MemberForm } from '@features/members/pages/member-form/member-form'
import { MemberService } from '@features/members/services/member-service'
import { ConfirmationModal } from '@shared/components/confirmation-modal/confirmation-modal'
import { TuiIcon } from '@taiga-ui/core'

@Component({
  selector: 'app-members-list',
  imports: [TuiIcon, MemberCard, MemberForm, ConfirmationModal],
  templateUrl: './members-list.html',
  styleUrl: './members-list.css',
})
export class MembersList {
  protected memberService = inject(MemberService)
  protected members = this.memberService.members
  protected totalMembers = this.memberService.totalMembers
  protected hasMembers = computed(() => (this.members() ?? []).length > 0)
  protected page = this.memberService.page
  protected pageSize = this.memberService.pageSize
  protected nextPage = this.memberService.nextPage
  protected previousPage = this.memberService.previousPage
  protected isLoading = this.memberService.isLoading
  protected isDeleting = this.memberService.isDeleting
  protected error = this.memberService.error
  protected showDeleteConfirmation = signal(false)
  searchTerm = this.memberService.searchTerm
  statusFilter = this.memberService.statusFilter

  isModalOpen = this.memberService.isModalOpen
  isEditingMember = this.memberService.editingMemberId

  startItem = computed(() => {
    return this.totalMembers() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1
  })

  endItem = computed(() => {
    const end = this.page() * this.pageSize()
    return end > this.totalMembers() ? this.totalMembers() : end
  })

  onSearch(value: string) {
    this.memberService.search(value)
    this.memberService.page.set(1)
  }

  onClearSearch() {
    this.memberService.search('')
    this.memberService.page.set(1)
  }

  onDeleteMember(id: number) {
    this.memberService.deletingMemberId.set(id)
    this.showDeleteConfirmation.set(true)
  }

  onConfirmDelete() {
    const id = this.memberService.deletingMemberId()
    if (id === null) return
    this.memberService.deleteMember(id).subscribe()
    this.showDeleteConfirmation.set(false)
  }

  onCancelDelete() {
    this.showDeleteConfirmation.set(false)
    this.memberService.deletingMemberId.set(null)
  }

  closeModal() {
    this.memberService.closeModal()
  }
}
