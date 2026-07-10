import { Component, computed, effect, inject, input, linkedSignal, output } from '@angular/core'
import { FormField, form, min, required } from '@angular/forms/signals'
import type { MembershipTypeRequestDto } from '@features/admin/models'
import { MembershipTypeService } from '@features/admin/services/membership-type-service'
import { ConfirmService } from '@shared/services/confirm-service'
import { TuiButton, TuiIcon } from '@taiga-ui/core'
import { TuiButtonLoading, TuiSwitch } from '@taiga-ui/kit'

const EMPTY_FORM_DATA = {
  name: '',
  amount: 0,
  description: '',
  durationDays: 30,
  isActive: true,
}

@Component({
  selector: 'app-admin-membership-type-form',
  imports: [FormField, TuiSwitch, TuiButton, TuiIcon, TuiButtonLoading],
  templateUrl: './membership-type-form.html',
})
export class AdminMembershipTypeForm {
  private service = inject(MembershipTypeService)
  private confirmSvc = inject(ConfirmService)

  typeId = input<number | null>(null)
  close = output<void>()

  protected isEditing = this.service.isEditing
  protected isCreating = this.service.isCreating

  protected editMode = computed(() => this.typeId() !== null)

  protected formData = linkedSignal(() => {
    const id = this.typeId()
    const type = this.service.detail()

    if (id === null || type?.id !== id) {
      return EMPTY_FORM_DATA
    }

    return {
      name: type.name,
      amount: parseFloat(type.amount) || 0,
      description: type.description,
      durationDays: type.durationDays,
      isActive: type.isActive,
    }
  })

  protected membershipTypeForm = form(this.formData, (path) => {
    required(path.name, { message: 'El nombre es obligatorio' })
    required(path.amount, { message: 'El monto es obligatorio' })
    min(path.amount, 1, { message: 'El monto debe ser mayor a 0' })
    required(path.durationDays, { message: 'La duración es obligatoria' })
    min(path.durationDays, 1, { message: 'La duración mínima es 1 día' })
  })

  constructor() {
    effect(() => {
      const id = this.typeId()
      if (id !== null) {
        this.service.loadMemberTypeDetail(id)
      }
    })
  }

  protected onCancel() {
    this.confirmSvc
      .open({
        title: this.editMode() ? 'Descartar Cambios' : 'Cancelar Creación',
        message: 'Los cambios no guardados se perderán',
        type: 'destructive',
        confirmText: 'Sí, Descartar',
        cancelText: 'No, Quedarme',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.membershipTypeForm().reset()
          this.close.emit()
        }
      })
  }

  protected onSave() {
    if (this.membershipTypeForm().invalid()) return

    const data = this.formData()

    const dto: MembershipTypeRequestDto = {
      name: data.name,
      amount: data.amount.toFixed(2),
      description: data.description || undefined,
      duration_days: data.durationDays,
      is_active: data.isActive,
    }

    if (this.editMode()) {
      const id = this.typeId()
      if (id === null) return
      this.service.update(id, dto).subscribe({
        next: () => {
          this.membershipTypeForm().reset()
          this.close.emit()
        },
      })
    } else {
      this.service.create(dto).subscribe({
        next: () => {
          this.membershipTypeForm().reset()
          this.close.emit()
        },
      })
    }
  }
}
