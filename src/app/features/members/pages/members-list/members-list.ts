import { Component, computed, inject, signal } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '@features/auth/services/auth-service'
import { MemberCard } from '@features/members/pages/member-card/member-card'
import { MemberForm } from '@features/members/pages/member-form/member-form'
import { PaymentRenew } from '@features/payments/pages/payment-renew/payment-renew'
import { MemberService } from '@features/members/services/member-service'
import { Sentinel } from '@shared/directives/sentinel'
import { ConfirmService } from '@shared/services/confirm-service'
import { TuiResponsiveDialog, TuiRipple } from '@taiga-ui/addon-mobile'
import { TuiButton, TuiIcon, TuiNotification } from '@taiga-ui/core'
import { TuiSegmented, TuiSkeleton } from '@taiga-ui/kit'
import { TuiCardLarge } from '@taiga-ui/layout'

@Component({
  selector: 'app-members-list',
  imports: [
    TuiIcon,
    MemberCard,
    MemberForm,
    PaymentRenew,
    TuiResponsiveDialog,
    TuiCardLarge,
    TuiSegmented,
    TuiRipple,
    TuiButton,
    TuiNotification,
    TuiSkeleton,
    Sentinel,
    RouterLink,
  ],
  templateUrl: './members-list.html',
})
export class MembersList {
  private memberService = inject(MemberService)
  private authService = inject(AuthService)
  protected router = inject(Router)

  protected isAdmin = this.authService.isAdmin

  private readonly confirmSvc = inject(ConfirmService)
  protected members = this.memberService.members
  protected totalMembers = this.memberService.totalMembers
  protected hasMembers = computed(() => (this.members() ?? []).length > 0)
  protected hasMorePages = computed(() => this.page() * this.pageSize() < this.totalMembers())
  protected page = this.memberService.page
  protected pageSize = this.memberService.pageSize
  protected nextPage = this.memberService.nextPage
  protected previousPage = this.memberService.previousPage
  protected isLoading = this.memberService.isLoading
  protected isDeleting = this.memberService.isDeleting
  protected error = this.memberService.error
  protected activeTabIndex = signal(0)
  protected sentinelDisabled = computed(() => this.isLoading() || !this.hasMorePages())
  searchTerm = this.memberService.searchTerm
  statusFilter = this.memberService.statusFilter

  onTabChange(index: number) {
    this.activeTabIndex.set(index)
    this.memberService.resetPage()

    if (index === 1) {
      this.memberService.setStatusFilter(true)
    } else if (index === 2) {
      this.memberService.setStatusFilter(false)
    } else {
      this.memberService.setStatusFilter(null)
    }

    this.memberService.reload()
  }

  isModalOpen = this.memberService.isModalOpen
  isEditingMember = this.memberService.editingMemberId

  protected isRenewOpen = signal(false)
  protected renewMemberId = signal<number | null>(null)
  protected renewMemberName = signal('')

  startItem = computed(() => {
    return this.totalMembers() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1
  })

  endItem = computed(() => {
    const end = this.page() * this.pageSize()
    return end > this.totalMembers() ? this.totalMembers() : end
  })

  onSearch(value: string) {
    this.memberService.search(value)
    this.memberService.resetPage()
  }

  onClearSearch() {
    this.memberService.search('')
    this.memberService.resetPage()
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

  protected reload() {
    this.memberService.reload()
  }

  protected openEditModal(id: number) {
    this.memberService.openEditModal(id)
  }

  protected openCreateModal() {
    this.memberService.openCreateModal()
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

  protected onLoadMore() {
    if (!this.isLoading() && this.hasMorePages()) {
      this.memberService.nextPage()
    }
  }
}
