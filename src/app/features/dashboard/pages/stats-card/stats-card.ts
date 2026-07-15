import { Component, computed, input, output } from '@angular/core'
import { TuiIcon } from '@taiga-ui/core'

@Component({
  selector: 'app-stat-card',
  imports: [TuiIcon],
  templateUrl: './stats-card.html',
})
export class StatsCard {
  icon = input.required<string>()

  protected iconName = computed(() => {
    const i = this.icon()
    return i.startsWith('@tui.') ? i : `@tui.${i}`
  })
  title = input.required<string>()
  value = input<string | number>('')
  bgColorClass = input<string>('bg-gray-100 dark:bg-gray-700')
  iconColorClass = input<string>('text-gray-500 dark:text-gray-400')
  isClickable = input<boolean>(false)
  accentColor = input<string>('orange')

  protected accentBarStyle = computed(() => {
    const c = this.accentColor()
    return `linear-gradient(to right, transparent, color-mix(in srgb, var(--color-${c}-500) 50%, transparent), transparent)`
  })

  cardClick = output<void>()

  onCardClick(): void {
    if (this.isClickable()) {
      this.cardClick.emit()
    }
  }
}
