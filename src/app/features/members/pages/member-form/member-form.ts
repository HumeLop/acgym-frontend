import { KeyValuePipe } from '@angular/common'
import { Component, computed, effect, inject, input, output, signal } from '@angular/core'
import { FormField, form, maxLength, required } from '@angular/forms/signals'
import type { MemberWriteDto } from '@app/features/members/models'
import { DateUtils } from '@app/shared/utils'
import { MemberService } from '@features/members/services/member-service'
import { ConfirmService } from '@shared/services/confirm-service'
import { TuiDay, TuiMonth } from '@taiga-ui/cdk'
import { TuiButton, TuiCalendar, TuiIcon } from '@taiga-ui/core'
import { TuiButtonLoading, TuiSwitch } from '@taiga-ui/kit'

@Component({
  selector: 'app-member-form',
  imports: [KeyValuePipe, TuiIcon, FormField, TuiCalendar, TuiSwitch, TuiButton, TuiButtonLoading],
  templateUrl: './member-form.html',
})
export class MemberForm {
  private memberService = inject(MemberService)
  private confirmSvc = inject(ConfirmService)

  memberId = input<number | null>(null)
  close = output<void>()

  protected calendarOpen = signal(false)
  protected calendarMonth = computed(
    () => new TuiMonth(this.memberData().dateOfBirth.year, this.memberData().dateOfBirth.month)
  )

  protected isEditing = this.memberService.isEditing
  protected isCreating = this.memberService.isCreating
  protected apiErrors = this.memberService.apiErrors
  protected generalError = this.memberService.generalError

  protected editMode = computed(() => this.memberId() !== null)

  private syncFormWithMember = effect(() => {
    const id = this.memberId()

    if (id === null) {
      this.memberData.set({
        name: '',
        phone: '',
        email: '',
        dateOfBirth: TuiDay.currentLocal(),
        emergencyContact: '',
        emergencyPhone: '',
        notes: '',
        notificationsEnabled: false,
      })
      return
    }

    this.memberService.loadMemberDetail(id)
    const member = this.memberService.memberDetail()
    if (member?.id !== id) return

    this.memberData.set({
      name: member.name,
      phone: member.phone ?? '',
      email: member.email ?? '',
      dateOfBirth: DateUtils.toTuiDay(member.dateOfBirth),
      emergencyContact: member.emergencyContact ?? '',
      emergencyPhone: member.emergencyPhone ?? '',
      notes: member.notes ?? '',
      notificationsEnabled: member.notificationsEnabled,
    })
  })

  protected formatDate(day: TuiDay): string {
    const date = new Date(day.year, day.month, day.day)
    return DateUtils.formatDateForDisplay(date)
  }

  memberData = signal({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: TuiDay.currentLocal(),
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
    notificationsEnabled: false,
  })

  memberForm = form(this.memberData, (path) => {
    required(path.name, { message: 'El nombre es obligatorio' })
    required(path.phone, {
      message: 'El teléfono es obligatorio',
    })
    maxLength(path.phone, 10, { message: 'El teléfono debe tener máximo 10 dígitos' })
    required(path.dateOfBirth, { message: 'La fecha de nacimiento es obligatoria' })
  })

  onDateChange(day: TuiDay) {
    this.memberData.update((data) => ({ ...data, dateOfBirth: day }))
    this.memberForm.dateOfBirth().markAsTouched()
    this.calendarOpen.set(false)
  }
  onCancel() {
    this.confirmSvc
      .open({
        title: this.isEditing() ? 'Descartar Cambios' : 'Cancelar Creación',
        message: this.isEditing() ? 'Los cambios no guardados se perderán' : 'La información ingresada se perderá',
        type: 'destructive',
        confirmText: 'Sí, Descartar',
        cancelText: 'No, Quedarme',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.memberForm().reset()
          this.close.emit()
        }
      })
  }

  onSave() {
    if (this.memberForm().invalid()) return

    const data = this.memberData()

    const memberDto: MemberWriteDto = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      date_of_birth: DateUtils.fromTuiDay(data.dateOfBirth),
      emergency_contact: data.emergencyContact,
      emergency_phone: data.emergencyPhone,
      notes: data.notes,
      notifications_enabled: data.notificationsEnabled,
    }

    if (this.editMode()) {
      const memberId = this.memberId()
      if (memberId === null) return
      this.memberService.updateMember(memberId, memberDto).subscribe({
        next: () => {
          this.memberForm().reset()
          this.close.emit()
        },
        error: () => {
          this.calendarOpen.set(false)
        },
      })
    } else {
      this.memberService.createMember(memberDto).subscribe({
        next: () => {
          this.memberForm().reset()
          this.close.emit()
        },
        error: () => {
          this.calendarOpen.set(false)
        },
      })
    }
  }
}
