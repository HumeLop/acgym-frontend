import { Component, computed, effect, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AdminMembershipTypeForm } from '@app/features/admin/pages/membership-type/membership-type-form/membership-type-form'
import { MembershipTypeService } from '@features/admin/services/membership-type-service'
import { DateUtils } from '@shared/utils/date.utils'
import { hapticMedium } from '@shared/utils/haptic'
import {
  TuiResponsiveDialog,
} from '@taiga-ui/addon-mobile'
import { TuiButton, TuiIcon } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiBlockStatus, TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-admin-membership-type-detail',
  imports: [
    RouterLink,
    TuiResponsiveDialog,
    TuiIcon,
    TuiSurface,
    TuiSkeleton,
    TuiButton,
    TuiBlockStatus,
    AdminMembershipTypeForm,
  ],
  templateUrl: './membership-type-detail.html',
})
export class AdminMembershipTypeDetail {
  private service = inject(MembershipTypeService)

  id = input.required<string>({ alias: 'id' })

  protected detail = this.service.detail
  protected stats = this.service.stats
  protected isLoadingDetail = this.service.isLoadingDetail
  protected isLoadingStats = this.service.isLoadingStats
  protected error = this.service.detailError

  protected isModalOpen = this.service.isModalOpen
  protected editingId = this.service.editingId

  protected closeModal() {
    this.service.closeModal()
  }

  protected isLoading = computed(() => this.isLoadingDetail() || this.isLoadingStats())

  protected formatDate(dateStr: string | null): string {
    if (!dateStr) return '—'
    const date = DateUtils.parseDateString(dateStr)
    if (!date) return '—'
    return DateUtils.formatDateForDisplay(date)
  }

  constructor() {
    effect(() => {
      const id = Number(this.id())
      if (id) this.service.loadMemberTypeDetail(id)
    })
  }

  protected onEdit() {
    hapticMedium()
    this.service.openEditModal(Number(this.id()))
  }
}
