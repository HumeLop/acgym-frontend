import { afterNextRender, DestroyRef, Directive, ElementRef, inject, output } from '@angular/core'

@Directive({
  selector: '[appSentinel]',
  standalone: true,
})
export class Sentinel {
  sentinelVisible = output<void>()

  private el = inject<ElementRef<HTMLElement>>(ElementRef)
  private destroyRef = inject(DestroyRef)

  private observer?: IntersectionObserver

  constructor() {
    afterNextRender(() => {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.sentinelVisible.emit()
          }
        },
        { threshold: 0.1 },
      )
      this.observer.observe(this.el.nativeElement)
    })

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect()
    })
  }
}
