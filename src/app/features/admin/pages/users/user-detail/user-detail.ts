import { Component, computed, effect, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AdminUserForm } from '@app/features/admin/pages/users/user-form/user-form'
import { UserService } from '@features/admin/services/user-service'
import { hapticMedium } from '@shared/utils/haptic'
import { TuiResponsiveDialog } from '@taiga-ui/addon-mobile'
import { TuiButton, TuiIcon, TuiNotification } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiBlockStatus, TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-admin-user-detail',
  imports: [
    RouterLink,
    TuiResponsiveDialog,
    TuiIcon,
    TuiSurface,
    TuiSkeleton,
    TuiNotification,
    TuiButton,
    TuiBlockStatus,
    AdminUserForm,
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

  constructor() {
    effect(() => {
      const id = Number(this.id())
      if (id) this.service.loadUserDetail(id)
    })
  }

  protected onEdit() {
    hapticMedium()
    this.service.openEditModal(Number(this.id()))
  }
}
