import { Component, input } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'

@Component({
  selector: 'app-navigation-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation-sidebar.html',
  styleUrl: './navigation-sidebar.css',
})
export class NavigationSidebar {
  readonly isOpen = input(false)
}
