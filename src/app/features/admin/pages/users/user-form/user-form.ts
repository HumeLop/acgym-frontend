import { Component, computed, effect, inject, input, linkedSignal, output } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { FormField, form, required } from '@angular/forms/signals'
import type { UserRequestDto } from '@features/admin/models'
import { UserService } from '@features/admin/services/user-service'
import { ConfirmService } from '@shared/services/confirm-service'
import type { TuiStringHandler } from '@taiga-ui/cdk'
import { TuiButton, TuiDataList, TuiDropdown, TuiIcon, TuiTextfield } from '@taiga-ui/core'
import { TuiButtonLoading, TuiSelect } from '@taiga-ui/kit'

const EMPTY_FORM_DATA = {
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  role: 'receptionist',
  password: '',
}

@Component({
  selector: 'app-admin-user-form',
  imports: [
    ReactiveFormsModule,
    FormField,
    TuiButton,
    TuiIcon,
    TuiButtonLoading,
    TuiTextfield,
    TuiSelect,
    TuiDataList,
    TuiDropdown,
  ],
  templateUrl: './user-form.html',
})
export class AdminUserForm {
  private userService = inject(UserService)
  private confirmSvc = inject(ConfirmService)

  userId = input<number | null>(null)
  close = output<void>()

  protected isEditing = this.userService.isEditing
  protected isCreating = this.userService.isCreating

  protected editMode = computed(() => this.userId() !== null)

  protected roles = ['receptionist', 'admin']

  protected roleStringify: TuiStringHandler<string> = (role) => (role === 'admin' ? 'Administrador' : 'Recepcionista')

  protected roleControl = new FormControl<string>('receptionist')

  protected formData = linkedSignal(() => {
    const id = this.userId()
    const user = this.userService.detail()

    if (id === null || user?.id !== id) {
      return EMPTY_FORM_DATA
    }

    return {
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      password: '',
    }
  })

  protected userForm = form(this.formData, (path) => {
    required(path.username, { message: 'El nombre de usuario es obligatorio' })
    required(path.role, { message: 'El rol es obligatorio' })
  })

  constructor() {
    effect(() => {
      const id = this.userId()
      if (id !== null) {
        this.userService.loadUserDetail(id)
      }
    })

    effect(() => {
      this.roleControl.setValue(this.formData().role, { emitEvent: false })
    })

    this.roleControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((val) => {
      if (val) {
        this.formData.update((d) => ({ ...d, role: val }))
        this.userForm.role().markAsTouched()
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
          this.userForm().reset()
          this.close.emit()
        }
      })
  }

  protected onSave() {
    if (this.userForm().invalid()) return

    const data = this.formData()

    const dto: UserRequestDto = {
      username: data.username,
      email: data.email || undefined,
      first_name: data.firstName || undefined,
      last_name: data.lastName || undefined,
      role: data.role,
      ...(data.password ? { password: data.password } : {}),
    }

    if (this.editMode()) {
      const id = this.userId()
      if (id === null) return
      this.userService.update(id, dto).subscribe({
        next: () => {
          this.userForm().reset()
          this.close.emit()
        },
      })
    } else {
      this.userService.create(dto).subscribe({
        next: () => {
          this.userForm().reset()
          this.close.emit()
        },
      })
    }
  }
}
