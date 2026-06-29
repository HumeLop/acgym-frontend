import { Component, computed, effect, inject, signal } from '@angular/core'
import { MemberCard } from '@features/members/pages/member-card/member-card'
import { MemberForm } from '@features/members/pages/member-form/member-form'
import { MemberService } from '@features/members/services/member-service'
import { WA_IS_ANDROID, WA_IS_IOS } from '@ng-web-apis/platform'
import { ConfirmationModal } from '@shared/components/confirmation-modal/confirmation-modal'
import {
  TUI_ANDROID_LOADER,
  TUI_PULL_TO_REFRESH_COMPONENT,
  TUI_PULL_TO_REFRESH_LOADED,
  TuiPullToRefresh,
  TuiResponsiveDialog,
  TuiRipple,
} from '@taiga-ui/addon-mobile'
import { TuiAutoFocus } from '@taiga-ui/cdk'
import { TuiIcon } from '@taiga-ui/core'
import { TuiTabs } from '@taiga-ui/kit'
import { TuiCardLarge } from '@taiga-ui/layout'
import { Subject } from 'rxjs'

@Component({
  selector: 'app-members-list',
  imports: [
    TuiIcon,
    MemberCard,
    MemberForm,
    ConfirmationModal,
    TuiResponsiveDialog,
    TuiPullToRefresh,
    TuiCardLarge,
    TuiTabs,
    TuiAutoFocus,
    TuiRipple,
  ],
  providers: [
    {
      provide: TUI_PULL_TO_REFRESH_LOADED,
      useClass: Subject,
    },
    {
      provide: TUI_PULL_TO_REFRESH_COMPONENT,
      useValue: TUI_ANDROID_LOADER,
    },
    {
      provide: WA_IS_ANDROID,
      useValue: true,
    },
    {
      provide: WA_IS_IOS,
      useValue: true,
    },
  ],
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
  protected activeTabIndex = signal(0)
  searchTerm = this.memberService.searchTerm
  statusFilter = this.memberService.statusFilter

  onTabChange(index: number) {
    this.activeTabIndex.set(index)
    this.memberService.page.set(1)

    if (index === 1) {
      this.memberService.statusFilter.set(true)
    } else if (index === 2) {
      this.memberService.statusFilter.set(false)
    } else {
      this.memberService.statusFilter.set(null)
    }

    this.memberService.reload()
  }

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

  private readonly loaded$ = inject<Subject<void>>(TUI_PULL_TO_REFRESH_LOADED)
  private readonly isPulling = signal(false)

  private readonly pullEffect = effect(() => {
    if (this.isPulling() && !this.memberService.isLoading()) {
      this.loaded$.next()
      this.isPulling.set(false)
    }
  })

  closeModal() {
    this.memberService.closeModal()
  }

  protected onPull() {
    this.memberService.reload()
    this.isPulling.set(true)
  }
}
