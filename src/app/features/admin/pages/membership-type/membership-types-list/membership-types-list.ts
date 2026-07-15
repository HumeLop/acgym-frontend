import { Component, inject } from '@angular/core'
import { AdminMembershipTypeCard } from '@app/features/admin/pages/membership-type/membership-type-card/membership-type-card'
import { AdminMembershipTypeForm } from '@app/features/admin/pages/membership-type/membership-type-form/membership-type-form'
import { MembershipTypeService } from '@features/admin/services/membership-type-service'
import { ConfirmService } from '@shared/services/confirm-service'
import { TuiResponsiveDialog, TuiRipple } from '@taiga-ui/addon-mobile'
import { TuiButton, TuiIcon, TuiNotification } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'

@Component({
  selector: 'app-admin-membership-types-list',
  imports: [
    TuiIcon,
    AdminMembershipTypeCard,
    AdminMembershipTypeForm,
    TuiResponsiveDialog,
    TuiRipple,
    TuiButton,
    TuiNotification,
    TuiSkeleton,
  ],
  templateUrl: './membership-types-list.html',
})
export class AdminMembershipTypesList {
  private service = inject(MembershipTypeService)
  private confirmSvc = inject(ConfirmService)

  protected types = this.service.types
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
        title: 'Eliminar tipo de membresía',
        message: '¿Estás seguro de eliminar este tipo de membresía?',
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
