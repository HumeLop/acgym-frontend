import { Component, inject, linkedSignal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { NavigationEnd, Router, RouterOutlet } from '@angular/router'
import { TuiIcon } from '@taiga-ui/core'
import { TuiSegmented } from '@taiga-ui/kit'
import { filter, map, startWith } from 'rxjs'

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, TuiSegmented, TuiIcon],
  templateUrl: './shell.html',
})
export class AdminShell {
  private readonly router = inject(Router)

  protected readonly tabs = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: '@tui.layout-dashboard' },
    { label: 'Usuarios', route: '/admin/users', icon: '@tui.users' },
    { label: 'Membresías', route: '/admin/membership-types', icon: '@tui.tags' },
  ]

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url.split('?')[0]),
      startWith(this.router.url.split('?')[0])
    )
  )

  protected readonly activeTab = linkedSignal(() => {
    const path = this.url()
    if (!path) return 0
    const idx = this.tabs.findIndex((t) => path.startsWith(t.route))
    return idx >= 0 ? idx : 0
  })

  protected onTabChange(index: number) {
    this.activeTab.set(index)
    this.router.navigate([this.tabs[index].route])
  }
}
