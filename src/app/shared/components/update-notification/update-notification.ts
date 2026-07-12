import { Component, inject, signal } from '@angular/core'
import { PwaUpdateService } from '@core/services/pwa-update-service'
import { TuiButton, TuiIcon } from '@taiga-ui/core'
import { TuiButtonLoading } from '@taiga-ui/kit'

@Component({
  selector: 'app-update-notification',
  imports: [TuiButton, TuiButtonLoading, TuiIcon],
  templateUrl: './update-notification.html',
})
export class UpdateNotification {
  private pwa = inject(PwaUpdateService)

  protected readonly isUpdating = this.pwa.isUpdating
  protected dismissed = signal(false)

  protected get isVisible(): boolean {
    return this.pwa.isUpdateAvailable() && !this.dismissed()
  }

  protected onUpdate() {
    this.pwa.activateUpdate()
  }

  protected onDismiss() {
    this.dismissed.set(true)
  }
}
