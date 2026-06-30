import { Component, input, output } from '@angular/core'
import { TuiIcon } from '@taiga-ui/core'

@Component({
  selector: 'app-confirmation-modal',
  imports: [TuiIcon],
  templateUrl: './confirmation-modal.html',
})
export class ConfirmationModal {
  title = input<string>('Confirmación')
  message = input<string>('¿Estás seguro de que deseas continuar?')
  confirmText = input<string>('Confirmar')
  cancelText = input<string>('Cancelar')
  icon = input<string>('@tui.help-circle')
  type = input<'confirm' | 'destructive'>('confirm')
  disabled = input<boolean>(false) // Tipo de modal

  confirm = output<void>()
  cancel = output<void>()

  onConfirm(): void {
    this.confirm.emit()
  }

  onCancel(): void {
    this.cancel.emit()
  }
}
