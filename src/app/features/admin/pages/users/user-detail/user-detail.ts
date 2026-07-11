import { Component, computed, effect, inject, input, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AdminUserForm } from '@app/features/admin/pages/users/user-form/user-form'
import { UserService } from '@features/admin/services/user-service'
import { WA_IS_ANDROID, WA_IS_IOS } from '@ng-web-apis/platform'
import { hapticMedium } from '@shared/utils/haptic'
import {
  TUI_ANDROID_LOADER,
  TUI_PULL_TO_REFRESH_COMPONENT,
  TUI_PULL_TO_REFRESH_LOADED,
  TUI_PULL_TO_REFRESH_THRESHOLD,
  TuiPullToRefresh,
  TuiResponsiveDialog,
} from '@taiga-ui/addon-mobile'
import { TuiButton, TuiIcon, TuiNotification } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiBlockStatus, TuiSurface } from '@taiga-ui/layout'
import { Subject } from 'rxjs'

@Component({
  selector: 'app-admin-user-detail',
  imports: [
    RouterLink,
    TuiPullToRefresh,
    TuiResponsiveDialog,
    TuiIcon,
    TuiSurface,
    TuiSkeleton,
    TuiNotification,
    TuiButton,
    TuiBlockStatus,
    AdminUserForm,
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
  templateUrl: './user-detail.html',
})
export class AdminUserDetail {
  private service = inject(UserService)

  id = input.required<string>({ alias: 'id' })

  protected detail = this.service.detail
  protected isLoadingDetail = this.service.isLoadingDetail
  protected error = this.service.detailError

  protected isModalOpen = this.service.isModalOpen
  protected editingId = this.service.editingId

  protected closeModal() {
    this.service.closeModal()
  }

  protected roleLabel = computed(() => {
    const user = this.detail()
    if (!user) return ''
    const labels: Record<string, string> = {
      admin: 'Administrador',
      receptionist: 'Recepcionista',
    }
    return labels[user.role] ?? user.role
  })

  protected roleIcon = computed(() => {
    const user = this.detail()
    if (!user) return ''
    const icons: Record<string, string> = {
      admin: '@tui.shield',
      receptionist: '@tui.user-check',
    }
    return icons[user.role] ?? '@tui.user'
  })

  private readonly loaded$ = inject<Subject<void>>(TUI_PULL_TO_REFRESH_LOADED)
  private readonly isPulling = signal(false)

  constructor() {
    effect(() => {
      const id = Number(this.id())
      if (id) this.service.loadUserDetail(id)
    })

    effect(() => {
      if (this.isPulling() && !this.isLoadingDetail()) {
        this.loaded$.next()
        this.isPulling.set(false)
      }
    })
  }

  protected onPull() {
    this.service.userDetailResource.reload()
    this.isPulling.set(true)
  }

  protected onEdit() {
    hapticMedium()
    this.service.openEditModal(Number(this.id()))
  }
}
