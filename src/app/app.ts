import { Component, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { ThemeService } from '@core/services/theme-service'
import { TuiRoot } from '@taiga-ui/core'

import { UpdateNotification } from '@shared/components/update-notification/update-notification'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot, UpdateNotification],
  templateUrl: './app.html',
})
export class App {
  private readonly themeService = inject(ThemeService)
  protected readonly isDark = this.themeService.isDark
}
