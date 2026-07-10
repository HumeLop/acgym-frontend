import { Component, computed, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AdminUserForm } from '@app/features/admin/pages/users/user-form/user-form'
import { MembershipTypeService } from '@features/admin/services/membership-type-service'
import { UserService } from '@features/admin/services/user-service'
import { TuiResponsiveDialog } from '@taiga-ui/addon-mobile'
import { TuiIcon } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, TuiResponsiveDialog, TuiIcon, TuiSkeleton, TuiSurface, AdminUserForm],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard {
  protected userService = inject(UserService)
  private membershipTypeService = inject(MembershipTypeService)

  protected readonly loading = computed(() => this.userService.isLoading() || this.membershipTypeService.isLoading())

  protected readonly statValues = computed(() => {
    if (this.loading()) return null
    return {
      userCount: this.userService.totalCount(),
      typeCount: this.membershipTypeService.totalCount(),
    }
  })

  protected readonly navigationLinks = [
    {
      title: 'Gestionar Usuarios',
      description: 'Administra los accesos al sistema. Crea, edita o desactiva usuarios.',
      icon: '@tui.users',
      route: '/admin/users',
    },
    {
      title: 'Tipos de Membresía',
      description: 'Configura los planes del gimnasio. Precios, duración y descripción.',
      icon: '@tui.tags',
      route: '/admin/membership-types',
    },
  ]
}
