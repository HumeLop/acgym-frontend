import { Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { ThemeService } from '@core/services/theme-service'
import { AuthService } from '@features/auth/services/auth-service'
import { ConfirmService } from '@shared/services/confirm-service'
import { hapticLight } from '@shared/utils/haptic'
import { TuiRipple, TuiTabBar, TuiTouchable } from '@taiga-ui/addon-mobile'
import { TuiIcon } from '@taiga-ui/core'
import { TuiTooltip } from '@taiga-ui/kit'
import { TuiNavigation } from '@taiga-ui/layout'
import { filter, map, startWith } from 'rxjs'

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TuiNavigation, TuiTabBar, TuiIcon, TuiTooltip, TuiTouchable, TuiRipple],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  private readonly router = inject(Router)
  private readonly themeSvc = inject(ThemeService)
  private readonly confirmSvc = inject(ConfirmService)
  private readonly authSvc = inject(AuthService)

  protected readonly isDark = this.themeSvc.isDark
  protected readonly mode = this.themeSvc.modeIndex
  protected readonly isAdmin = this.authSvc.isAdmin

  protected readonly modeIcons = ['@tui.sun', '@tui.moon', '@tui.sun-moon']
  protected readonly modeLabels = ['Claro', 'Oscuro', 'Sistema']
  protected readonly modeAriaLabels = ['Modo claro', 'Modo oscuro', 'Tema del sistema']

  private readonly tabTitles: Record<string, string> = {
    '/members': 'Miembros',
    '/payments': 'Pagos',
    '/admin': 'Administración',
  }

  protected readonly currentTabTitle = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.getTabTitle(this.router.url.split('?')[0])),
      startWith(this.getTabTitle(this.router.url.split('?')[0]))
    ),
    { initialValue: 'Inicio' }
  )

  private getTabTitle(path: string): string {
    for (const [prefix, title] of Object.entries(this.tabTitles)) {
      if (path.startsWith(prefix)) return title
    }
    return 'Inicio'
  }

  protected onTabTap() {
    hapticLight()
  }

  protected onLogout() {
    this.confirmSvc
      .open({
        title: 'Cerrar sesión',
        message: '¿Estás seguro de cerrar sesión?',
        type: 'destructive',
        confirmText: 'Cerrar sesión',
        cancelText: 'Cancelar',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.authSvc.logout()
        }
      })
  }

  protected nextMode() {
    this.themeSvc.nextMode()
  }
}
