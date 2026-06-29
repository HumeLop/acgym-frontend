import { Component, computed, effect, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { MemberService } from '@features/members/services/member-service'
import { TuiItem } from '@taiga-ui/cdk'
import { TuiIcon, TuiLink } from '@taiga-ui/core'
import { TuiBreadcrumbs } from '@taiga-ui/kit'

@Component({
  selector: 'app-member-details',
  imports: [RouterLink, TuiIcon, TuiBreadcrumbs, TuiLink, TuiItem],
  templateUrl: './member-details.html',
  styleUrl: './member-details.css',
})
export class MemberDetails {
  private memberService = inject(MemberService)

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
    const date = new Date(m.createdAt)
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
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
}
