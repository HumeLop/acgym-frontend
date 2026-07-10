import { Component, computed, effect, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { WA_IS_ANDROID, WA_IS_IOS } from '@ng-web-apis/platform'
import {
  TUI_ANDROID_LOADER,
  TUI_PULL_TO_REFRESH_COMPONENT,
  TUI_PULL_TO_REFRESH_LOADED,
  TUI_PULL_TO_REFRESH_THRESHOLD,
  TuiPullToRefresh,
  TuiResponsiveDialog,
} from '@taiga-ui/addon-mobile'
import { TuiIcon } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiSurface } from '@taiga-ui/layout'
import { MemberForm } from '@features/members/pages/member-form/member-form'
import { MemberService } from '@features/members/services/member-service'
import { Subject } from 'rxjs'

@Component({
  selector: 'app-member-dashboard',
  imports: [
    RouterLink,
    TuiPullToRefresh,
    TuiResponsiveDialog,
    TuiIcon,
    TuiSurface,
    TuiSkeleton,
    MemberForm,
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
  templateUrl: './member-dashboard.html',
})
export class MemberDashboard {
  protected memberService = inject(MemberService)

  protected loading = this.memberService.isLoading

  protected statValues = computed(() => ({
    totalMembers: this.memberService.totalMembers(),
    expiringCount: this.memberService.hasExpiringResults(),
  }))

  private readonly loaded$ = inject<Subject<void>>(TUI_PULL_TO_REFRESH_LOADED)
  private readonly isPulling = signal(false)

  private readonly pullEffect = effect(() => {
    if (this.isPulling() && !this.loading()) {
      this.loaded$.next()
      this.isPulling.set(false)
    }
  })

  protected onPull() {
    this.memberService.reload()
    this.isPulling.set(true)
  }
}
