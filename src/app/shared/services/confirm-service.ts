import { inject, Service } from '@angular/core'
import { type ConfirmData, ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog'
import { TuiDialogService } from '@taiga-ui/core'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import { map, type Observable } from 'rxjs'

export interface ConfirmOptions {
  title: string
  message: string
  type?: 'confirm' | 'destructive'
  confirmText?: string
  cancelText?: string
}

@Service()
export class ConfirmService {
  private dialogs = inject(TuiDialogService)

  open(options: ConfirmOptions): Observable<boolean> {
    const data: ConfirmData = {
      message: options.message,
      type: options.type ?? 'confirm',
      confirmText: options.confirmText ?? 'Confirmar',
      cancelText: options.cancelText ?? 'Cancelar',
    }

    return this.dialogs
      .open<boolean>(new PolymorpheusComponent(ConfirmDialogComponent), {
        label: options.title,
        size: 's',
        data,
      })
      .pipe(map((result) => result ?? false))
  }
}
