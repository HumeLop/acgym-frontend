import { Component, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { MemberCard } from '@app/features/members/pages/member-card/member-card'
import { MemberService } from '@features/members/services/member-service'
import { PaymentRenew } from '@features/payments/pages/payment-renew/payment-renew'
import { TuiResponsiveDialog, TuiRipple } from '@taiga-ui/addon-mobile'
import { TuiButton, TuiIcon, TuiNotification } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiCardLarge } from '@taiga-ui/layout'
import { MemberForm } from '../member-form/member-form'

@Component({
  selector: 'app-inactive-members-list',
  imports: [
    TuiIcon,
    TuiNotification,
    TuiCardLarge,
    TuiButton,
    MemberCard,
    MemberForm,
    PaymentRenew,
    TuiResponsiveDialog,
    TuiRipple,
    TuiSkeleton,
    RouterLink,
  ],
  templateUrl: './inactive-members-list.html',
  styleUrl: './inactive-members-list.css',
})
export class InactiveMembersList {
  private memberService = inject(MemberService)

  protected members = this.memberService.inactiveMembers
  protected isLoading = this.memberService.inactiveMembersLoading
  protected error = this.memberService.inactiveMembersError
  protected totalCount = this.memberService.inactiveMembersCount
  protected searchTerm = this.memberService.inactiveSearchTerm
  protected hasMembers = this.totalCount

  isModalOpen = this.memberService.isModalOpen
  isEditingMember = this.memberService.editingMemberId

  protected isRenewOpen = signal(false)
  protected renewMemberId = signal<number | null>(null)
  protected renewMemberName = signal('')

  onSearch(value: string) {
    this.memberService.inactiveSearch(value)
  }

  onClearSearch() {
    this.memberService.inactiveSearch('')
  }

  closeModal() {
    this.memberService.closeModal()
  }

  protected openEditModal(id: number) {
    this.memberService.openEditModal(id)
  }

  protected openCreateModal() {
    this.memberService.openCreateModal()
  }
  protected reload() {
    this.memberService.reload()
  }

  protected openRenewModal(member: { id: number; name: string }) {
    this.renewMemberId.set(member.id)
    this.renewMemberName.set(member.name)
    this.isRenewOpen.set(true)
  }

  protected closeRenewModal() {
    this.isRenewOpen.set(false)
    this.renewMemberId.set(null)
    this.renewMemberName.set('')
  }
}
