import { Component, input, output } from '@angular/core'
import { TuiIcon } from '@taiga-ui/core'
@Component({
  selector: 'app-stat-card',
  imports: [TuiIcon],
  templateUrl: './stats-card.html',
  styleUrl: './stats-card.css',
})
export class StatsCard {
  icon = input.required<string>()
  title = input.required<string>()
  value = input<string | number>('')
  bgColorClass = input<string>('bg-gray-100 dark:bg-gray-700')
  iconColorClass = input<string>('text-gray-500 dark:text-gray-400')
  isClickable = input<boolean>(false)

  cardClick = output<void>()

  onCardClick(): void {
    if (this.isClickable()) {
      this.cardClick.emit()
    }
  }
}
