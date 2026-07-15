import { Component, computed, effect, inject, input, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AuthService } from '@features/auth/services/auth-service'
import { MemberForm } from '@features/members/pages/member-form/member-form'
import { MemberService } from '@features/members/services/member-service'
import { PaymentRenew } from '@features/payments/pages/payment-renew/payment-renew'
import { DateUtils } from '@shared/utils/date.utils'
import { hapticMedium } from '@shared/utils/haptic'
import { TuiResponsiveDialog } from '@taiga-ui/addon-mobile'
import { TuiButton, TuiIcon } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiBlockStatus, TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-member-details',
  imports: [
    RouterLink,
    TuiResponsiveDialog,
    TuiIcon,
    TuiSurface,
    TuiSkeleton,
    TuiButton,
    TuiBlockStatus,
    MemberForm,
    PaymentRenew,
  ],
  templateUrl: './member-details.html',
})
export class MemberDetails {
  private memberService = inject(MemberService)
  private authService = inject(AuthService)

  protected isAdmin = this.authService.isAdmin
  protected isModalOpen = this.memberService.isModalOpen
  protected editingMemberId = this.memberService.editingMemberId

  protected isRenewOpen = signal(false)

  id = input.required<string>({ alias: 'id' })

  protected memberDetail = this.memberService.memberDetail
  protected isLoading = this.memberService.isLoadingDetail
  protected error = this.memberService.detailError

  constructor() {
    effect(() => {
      const id = Number(this.id())
      if (id) this.memberService.loadMemberDetail(id)
    })
  }

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
      ...(m.emergencyContact
        ? [{ icon: '@tui.phone-forwarded', label: 'Contacto de Emergencia', value: m.emergencyContact }]
        : []),
      ...(m.emergencyPhone ? [{ icon: '@tui.stethoscope', label: 'Tel. Emergencia', value: m.emergencyPhone }] : []),
      ...(m.notes ? [{ icon: '@tui.file-text', label: 'Notas', value: m.notes }] : []),
      {
        icon: '@tui.bell',
        label: 'Notificaciones',
        value: m.notificationsEnabled ? 'Activadas' : 'Desactivadas',
      },
    ]
  })

  protected formatCurrency(value: number): string {
    return value.toFixed(2)
  }

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

  protected formatShortDate(dateStr: string | null): string {
    if (!dateStr) return '—'
    const date = DateUtils.parseDateString(dateStr)
    if (!date) return '—'
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  protected onEdit() {
    hapticMedium()
    this.memberService.openEditModal(Number(this.id()))
  }

  protected onRenew() {
    hapticMedium()
    this.isRenewOpen.set(true)
  }

  protected closeRenewModal() {
    this.isRenewOpen.set(false)
  }

  protected closeModal() {
    this.memberService.closeModal()
  }
}
