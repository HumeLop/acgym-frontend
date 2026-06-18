import { Component, output } from '@angular/core'

@Component({
  selector: 'app-mobile-header',
  imports: [],
  templateUrl: './mobile-header.html',
  styleUrl: './mobile-header.css',
})
export class MobileHeader {
  readonly toggle = output<void>()
}
