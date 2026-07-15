import { afterNextRender, DestroyRef, Directive, ElementRef, effect, inject, input, output } from '@angular/core'

@Directive({
  selector: '[appSentinel]',
  standalone: true,
})
export class Sentinel {
  sentinelVisible = output<void>()

  appSentinelDisabled = input(false)

  private el = inject<ElementRef<HTMLElement>>(ElementRef)
  private destroyRef = inject(DestroyRef)

  private observer?: IntersectionObserver
  private fired = false

  constructor() {
    effect(() => {
      if (this.appSentinelDisabled() || this.fired) {
        this.observer?.unobserve(this.el.nativeElement)
      } else {
        this.fired = false
        this.observer?.observe(this.el.nativeElement)
      }
    })

    afterNextRender(() => {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !this.fired) {
            this.fired = true
            this.sentinelVisible.emit()
          }
        },
        { threshold: 0.1 }
      )

      if (!this.appSentinelDisabled()) {
        this.observer.observe(this.el.nativeElement)
      }
    })

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect()
    })
  }
}
