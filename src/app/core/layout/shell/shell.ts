import { Component, inject } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { ThemeService } from '@core/services/theme-service'
import { TuiTabBar } from '@taiga-ui/addon-mobile'
import { TuiIcon } from '@taiga-ui/core'
import { TuiTooltip } from '@taiga-ui/kit'
import { TuiNavigation } from '@taiga-ui/layout'

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TuiNavigation, TuiTabBar, TuiIcon, TuiTooltip],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  private readonly themeSvc = inject(ThemeService)
  protected readonly isDark = this.themeSvc.isDark
  protected readonly mode = this.themeSvc.modeIndex

  protected readonly modeIcons = ['@tui.sun', '@tui.moon', '@tui.sun-moon']
  protected readonly modeLabels = ['Claro', 'Oscuro', 'Sistema']
  protected readonly modeAriaLabels = ['Modo claro', 'Modo oscuro', 'Tema del sistema']

  protected nextMode() {
    this.themeSvc.nextMode()
  }
}
