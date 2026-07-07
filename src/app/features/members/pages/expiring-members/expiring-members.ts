import { Component, effect, inject, signal } from '@angular/core'
import { MemberCard } from '@features/members/pages/member-card/member-card'
import { MemberForm } from '@features/members/pages/member-form/member-form'
import { MemberService } from '@features/members/services/member-service'
import { ConfirmService } from '@shared/services/confirm-service'
import { WA_IS_ANDROID, WA_IS_IOS } from '@ng-web-apis/platform'
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
import { TuiIcon, TuiNotification } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiCardLarge } from '@taiga-ui/layout'
import { Subject } from 'rxjs'

@Component({
  selector: 'app-expiring-members',
  imports: [
    TuiIcon,
    TuiNotification,
    TuiCardLarge,
    MemberCard,
    MemberForm,
    TuiResponsiveDialog,
    TuiPullToRefresh,
    TuiRipple,
    TuiElasticSticky,
    TuiSkeleton,
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
  templateUrl: './expiring-members.html',
})
export class ExpiringMembers {
  protected memberService = inject(MemberService)
  private readonly confirmSvc = inject(ConfirmService)
  private readonly isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

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

  // Elastic sticky header
  protected headerScale = signal(1)

  protected onElastic(scale: number): void {
    this.headerScale.set(tuiClamp(scale, 0.6, 1))
  }

  private readonly loaded$ = inject<Subject<void>>(TUI_PULL_TO_REFRESH_LOADED)
  private readonly isPulling = signal(false)

  private readonly pullEffect = effect(() => {
    if (this.isPulling() && !this.memberService.isLoading()) {
      this.loaded$.next()
      this.isPulling.set(false)
    }
  })

  protected onPull() {
    if (window.scrollY > 0) return
    if (!this.isTouchDevice) return
    this.memberService.page.set(1)
    this.memberService.reload()
    this.isPulling.set(true)
  }
}
