import { Component, inject } from '@angular/core'
import { AdminUserCard } from '@app/features/admin/pages/users/user-card/user-card'
import { AdminUserForm } from '@app/features/admin/pages/users/user-form/user-form'
import { UserService } from '@features/admin/services/user-service'
import { ConfirmService } from '@shared/services/confirm-service'
import {
  TuiResponsiveDialog,
  TuiRipple,
} from '@taiga-ui/addon-mobile'
import { TuiButton, TuiIcon, TuiNotification } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'

@Component({
  selector: 'app-admin-users-list',
  imports: [
    TuiIcon,
    AdminUserCard,
    AdminUserForm,
    TuiResponsiveDialog,
    TuiRipple,
    TuiButton,
    TuiNotification,
    TuiSkeleton,
  ],
  templateUrl: './users-list.html',
})
export class AdminUsersList {
  private service = inject(UserService)
  private confirmSvc = inject(ConfirmService)

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
}
