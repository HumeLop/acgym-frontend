import { Component, inject } from '@angular/core'
import type { TuiDialogContext } from '@taiga-ui/core'
import { TuiButton } from '@taiga-ui/core'
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus'

export interface ConfirmData {
  message: string
  type: 'confirm' | 'destructive'
  confirmText: string
  cancelText: string
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [TuiButton],
  template: `
    <div class="flex flex-col gap-4 p-2">
      <p class="text-sm text-(--tui-text-secondary)">{{ context.data.message }}</p>
      <div class="flex gap-3 justify-end">
        <button
          tuiButton
          appearance="secondary"
          size="m"
          (click)="context.completeWith(false)"
        >
          {{ context.data.cancelText }}
        </button>
        <button
          tuiButton
          size="m"
          [appearance]="context.data.type === 'destructive' ? 'accent' : 'primary'"
          (click)="context.completeWith(true)"
        >
          {{ context.data.confirmText }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  protected readonly context = inject<TuiDialogContext<boolean, ConfirmData>>(POLYMORPHEUS_CONTEXT)
}
