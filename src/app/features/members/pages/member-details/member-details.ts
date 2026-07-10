import { Component, computed, effect, inject, input, signal } from '@angular/core'
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
import { TuiButton, TuiIcon } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiBlockStatus, TuiSurface } from '@taiga-ui/layout'
import { MemberForm } from '@features/members/pages/member-form/member-form'
import { MemberService } from '@features/members/services/member-service'
import { hapticMedium } from '@shared/utils/haptic'
import { DateUtils } from '@shared/utils/date.utils'
import { Subject } from 'rxjs'

@Component({
  selector: 'app-member-details',
  imports: [
    RouterLink,
    TuiPullToRefresh,
    TuiResponsiveDialog,
    TuiIcon,
    TuiSurface,
    TuiSkeleton,
    TuiButton,
    TuiBlockStatus,
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
  templateUrl: './member-details.html',
})
export class MemberDetails {
  protected memberService = inject(MemberService)

  id = input.required<string>({ alias: 'id' })

  protected memberDetail = this.memberService.memberDetail
  protected isLoading = this.memberService.isLoadingDetail
  protected error = this.memberService.detailError

  private _loadEffect = effect(() => {
    const id = Number(this.id())
    if (id) this.memberService.loadMemberDetail(id)
  })

  protected memberSince = computed(() => {
    const m = this.memberDetail()
    if (!m) return ''
    const date = DateUtils.parseDateString(m.createdAt)
    if (!date) return ''
    return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
  })

  protected expirationDays = computed(() => this.memberDetail()?.daysUntilExpiration ?? null)

  protected personalInfo = computed(() => {
    const m = this.memberDetail()
    if (!m) return []
    return [
      { icon: '@tui.phone', label: 'Teléfono', value: m.phone ?? 'Sin registrar' },
      { icon: '@tui.mail', label: 'Email', value: m.email ?? 'Sin registrar' },
      { icon: '@tui.cake', label: 'Fecha de Nacimiento', value: m.dateOfBirth ?? 'Sin registrar' },
      { icon: '@tui.users', label: 'Edad', value: `${m.age} años` },
      {
        icon: '@tui.phone-forwarded',
        label: 'Contacto de Emergencia',
        value: m.emergencyContact ?? 'Sin registrar',
      },
      {
        icon: '@tui.stethoscope',
        label: 'Tel. Emergencia',
        value: m.emergencyPhone ?? 'Sin registrar',
      },
      { icon: '@tui.file-text', label: 'Notas', value: m.notes ?? 'Sin notas' },
      {
        icon: '@tui.bell',
        label: 'Notificaciones',
        value: m.notificationsEnabled ? 'Activadas' : 'Desactivadas',
      },
    ]
  })

  protected getPaymentSummary(key: string): number {
    const summary = this.memberDetail()?.paymentSummary as Record<string, number> | undefined
    return summary?.[key] ?? 0
  }

  protected formatDate(dateStr: string | null): string {
    if (!dateStr) return '—'
    const date = DateUtils.parseDateString(dateStr)
    if (!date) return '—'
    return DateUtils.formatDateForDisplay(date)
  }

  private readonly loaded$ = inject<Subject<void>>(TUI_PULL_TO_REFRESH_LOADED)
  private readonly isPulling = signal(false)

  private readonly pullEffect = effect(() => {
    if (this.isPulling() && !this.isLoading()) {
      this.loaded$.next()
      this.isPulling.set(false)
    }
  })

  protected onPull() {
    this.memberService.memberDetailResource.reload()
    this.isPulling.set(true)
  }

  protected onEdit() {
    hapticMedium()
    this.memberService.openEditModal(Number(this.id()))
  }
}
