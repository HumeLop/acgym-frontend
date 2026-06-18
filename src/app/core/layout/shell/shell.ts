import { Component, signal } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { MobileHeader } from '@core/layout/mobile-header/mobile-header'
import { NavigationSidebar } from '@core/layout/navigation-sidebar/navigation-sidebar'

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, NavigationSidebar, MobileHeader],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  readonly isSidebarOpen = signal(false)

  toggleSidebar() {
    this.isSidebarOpen.update((v) => !v)
  }
}
