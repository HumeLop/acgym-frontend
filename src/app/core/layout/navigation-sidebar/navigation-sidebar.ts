import { Component, input } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { TuiIcon } from '@taiga-ui/core'

@Component({
  selector: 'app-navigation-sidebar',
  imports: [RouterLink, RouterLinkActive, TuiIcon],
  templateUrl: './navigation-sidebar.html',
  styleUrl: './navigation-sidebar.css',
})
export class NavigationSidebar {
  readonly isOpen = input(false)
}
