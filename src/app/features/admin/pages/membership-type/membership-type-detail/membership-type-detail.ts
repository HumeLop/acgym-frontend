import { Component, computed, effect, inject, input, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AdminMembershipTypeForm } from '@app/features/admin/pages/membership-type/membership-type-form/membership-type-form'
import { MembershipTypeService } from '@features/admin/services/membership-type-service'
import { WA_IS_ANDROID, WA_IS_IOS } from '@ng-web-apis/platform'
import { DateUtils } from '@shared/utils/date.utils'
import { hapticMedium } from '@shared/utils/haptic'
import {
  TUI_ANDROID_LOADER,
  TUI_PULL_TO_REFRESH_COMPONENT,
  TUI_PULL_TO_REFRESH_LOADED,
  TUI_PULL_TO_REFRESH_THRESHOLD,
  TuiPullToRefresh,
  TuiResponsiveDialog,
} from '@taiga-ui/addon-mobile'
import { TuiButton, TuiIcon } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiBlockStatus, TuiSurface } from '@taiga-ui/layout'
import { Subject } from 'rxjs'

@Component({
  selector: 'app-admin-membership-type-detail',
  imports: [
    RouterLink,
    TuiPullToRefresh,
    TuiResponsiveDialog,
    TuiIcon,
    TuiSurface,
    TuiSkeleton,
    TuiButton,
    TuiBlockStatus,
    AdminMembershipTypeForm,
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

  private readonly loaded$ = inject<Subject<void>>(TUI_PULL_TO_REFRESH_LOADED)
  private readonly isPulling = signal(false)

  constructor() {
    effect(() => {
      const id = Number(this.id())
      if (id) this.service.loadMemberTypeDetail(id)
    })

    effect(() => {
      if (this.isPulling() && !this.isLoading()) {
        this.loaded$.next()
        this.isPulling.set(false)
      }
    })
  }

  protected onPull() {
    this.service.memberTypeDetailResource.reload()
    this.service.memberTypeStatsResource.reload()
    this.isPulling.set(true)
  }

  protected onEdit() {
    hapticMedium()
    this.service.openEditModal(Number(this.id()))
  }
}
