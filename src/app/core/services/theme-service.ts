import { computed, effect, inject, Service, signal } from '@angular/core'
import { TUI_DARK_MODE } from '@taiga-ui/core'

export type ThemeMode = 'light' | 'dark' | 'system'

@Service()
export class ThemeService {
  private readonly darkModeSvc = inject(TUI_DARK_MODE)
  private readonly mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  readonly osPrefersDark = signal(this.mediaQuery.matches)

  readonly mode = signal<ThemeMode>(this.getInitialMode())

  readonly isDark = computed(() => {
    const mode = this.mode()
    if (mode === 'dark') return true
    if (mode === 'light') return false
    return this.osPrefersDark()
  })

  readonly modes: ThemeMode[] = ['light', 'dark', 'system']

  readonly modeIndex = computed(() => this.modes.indexOf(this.mode()))

  constructor() {
    effect(() => {
      const mode = this.mode()
      const isDark = this.isDark()

      if (mode === 'system') {
        localStorage.removeItem('theme')
      } else {
        localStorage.setItem('theme', mode)
      }

      this.darkModeSvc.set(isDark)
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
      document.documentElement.setAttribute('tuiTheme', isDark ? 'dark' : 'light')
    })

    this.mediaQuery.addEventListener('change', (e: MediaQueryListEvent) => {
      this.osPrefersDark.set(e.matches)
    })
  }

  private getInitialMode(): ThemeMode {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark' || stored === 'light') return stored
    return 'system'
  }

  nextMode(): void {
    const next = (this.modeIndex() + 1) % this.modes.length
    this.mode.set(this.modes[next])
  }
}
