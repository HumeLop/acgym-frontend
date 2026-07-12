import { Component, computed, effect, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from '@features/auth/services/auth-service'
import { MemberCard } from '@features/members/pages/member-card/member-card'
import { MemberForm } from '@features/members/pages/member-form/member-form'
import { MemberService } from '@features/members/services/member-service'
import { WA_IS_ANDROID, WA_IS_IOS } from '@ng-web-apis/platform'
import { ConfirmService } from '@shared/services/confirm-service'
import { Sentinel } from '@shared/directives/sentinel'
import {
  TUI_ANDROID_LOADER,
  TUI_PULL_TO_REFRESH_COMPONENT,
  TUI_PULL_TO_REFRESH_LOADED,
  TUI_PULL_TO_REFRESH_THRESHOLD,
  TuiElasticSticky,
  TuiPullToRefresh,
  TuiResponsiveDialog,
  TuiRipple,
} from '@taiga-ui/addon-mobile'
import { tuiClamp } from '@taiga-ui/cdk'
import { TuiButton, TuiIcon, TuiNotification } from '@taiga-ui/core'
import { TuiSegmented, TuiSkeleton } from '@taiga-ui/kit'
import { TuiCardLarge } from '@taiga-ui/layout'
import { Subject } from 'rxjs'

@Component({
  selector: 'app-members-list',
  imports: [
    TuiIcon,
    MemberCard,
    MemberForm,
    TuiResponsiveDialog,
    TuiPullToRefresh,
    TuiCardLarge,
    TuiSegmented,
    TuiRipple,
    TuiButton,
    TuiNotification,
    TuiElasticSticky,
    TuiSkeleton,
    Sentinel,
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
    {
      provide: TUI_PULL_TO_REFRESH_THRESHOLD,
      useValue: 120,
    },
  ],
  templateUrl: './members-list.html',
})
export class MembersList {
  private memberService = inject(MemberService)
  private authService = inject(AuthService)
  protected router = inject(Router)

  protected isAdmin = this.authService.isAdmin

  private readonly confirmSvc = inject(ConfirmService)
  private readonly isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
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
  protected activeTabIndex = signal(0)
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

  private readonly loaded$ = inject<Subject<void>>(TUI_PULL_TO_REFRESH_LOADED)
  private readonly isPulling = signal(false)

  constructor() {
    effect(() => {
      if (this.isPulling() && !this.memberService.isLoading()) {
        this.loaded$.next()
        this.isPulling.set(false)
      }
    })
  }

  closeModal() {
    this.memberService.closeModal()
  }

  // Elastic sticky header
  protected headerScale = signal(1)

  protected onElastic(scale: number): void {
    this.headerScale.set(tuiClamp(scale, 0.6, 1))
  }

  protected onPull() {
    if (window.scrollY > 0) return
    if (!this.isTouchDevice) return

    this.memberService.resetPage()
    this.memberService.reload()
    this.isPulling.set(true)
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

  protected onLoadMore() {
    if (!this.isLoading()) {
      this.memberService.nextPage()
    }
  }
}
