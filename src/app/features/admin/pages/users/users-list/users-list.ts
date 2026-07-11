import { Component, inject } from '@angular/core'
import { AdminUserCard } from '@app/features/admin/pages/users/user-card/user-card'
import { AdminUserForm } from '@app/features/admin/pages/users/user-form/user-form'
import { UserService } from '@features/admin/services/user-service'
import { WA_IS_ANDROID, WA_IS_IOS } from '@ng-web-apis/platform'
import { ConfirmService } from '@shared/services/confirm-service'
import {
  TUI_PULL_TO_REFRESH_COMPONENT,
  TUI_PULL_TO_REFRESH_LOADED,
  TUI_PULL_TO_REFRESH_THRESHOLD,
  TuiPullToRefresh,
  TuiResponsiveDialog,
  TuiRipple,
} from '@taiga-ui/addon-mobile'
import { TuiButton, TuiIcon, TuiNotification } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { Subject } from 'rxjs'

@Component({
  selector: 'app-admin-users-list',
  imports: [
    TuiIcon,
    AdminUserCard,
    AdminUserForm,
    TuiResponsiveDialog,
    TuiPullToRefresh,
    TuiRipple,
    TuiButton,
    TuiNotification,
    TuiSkeleton,
  ],
  providers: [
    {
      provide: TUI_PULL_TO_REFRESH_LOADED,
      useClass: Subject,
    },
    {
      provide: TUI_PULL_TO_REFRESH_COMPONENT,
      useValue: WA_IS_ANDROID,
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
  templateUrl: './users-list.html',
})
export class AdminUsersList {
  private service = inject(UserService)
  private confirmSvc = inject(ConfirmService)
  private readonly isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  protected users = this.service.users
  protected totalCount = this.service.totalCount
  protected isLoading = this.service.isLoading
  protected error = this.service.error

  protected isModalOpen = this.service.isModalOpen
  protected editingId = this.service.editingId

  protected reload() {
    this.service.reload()
  }

  protected openEditModal(id: number) {
    this.service.openEditModal(id)
  }

  protected openCreateModal() {
    this.service.openCreateModal()
  }

  protected closeModal() {
    this.service.closeModal()
  }

  protected onDelete(id: number) {
    this.confirmSvc
      .open({
        title: 'Eliminar usuario',
        message: '¿Estás seguro de eliminar este usuario?',
        type: 'destructive',
        confirmText: 'Eliminar',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.service.delete(id).subscribe()
        }
      })
  }

  protected onPull() {
    if (window.scrollY > 0) return
    if (!this.isTouchDevice) return

    this.reload()
  }
}
