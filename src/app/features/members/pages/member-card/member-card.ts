import { Component, input, output } from '@angular/core'
import { RouterLink } from '@angular/router'
import type { Member } from '@features/members/models'
import { TuiIcon } from '@taiga-ui/core'

@Component({
  selector: 'app-member-card',
  imports: [RouterLink, TuiIcon],
  templateUrl: './member-card.html',
  styleUrl: './member-card.css',
})
export class MemberCard {
  member = input.required<Member>()

  edit = output<number>()
  delete = output<number>()

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }
}
