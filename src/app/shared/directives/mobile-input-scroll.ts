import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core'

const FORM_ELEMENTS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

@Directive({
  selector: '[mobileInputScroll]',
  standalone: true,
})
export class MobileInputScroll {
  private el = inject<ElementRef<HTMLElement>>(ElementRef)
  private destroyRef = inject(DestroyRef)

  private activeInput: HTMLElement | null = null

  constructor() {
    afterNextRender(() => this.init())
  }

  private init(): void {
    const host = this.el.nativeElement

    host.addEventListener('focusin', this.onFocusIn, true)
    host.addEventListener('focusout', this.onFocusOut, true)

    if (this.hasVisualViewport) {
      window.visualViewport?.addEventListener('resize', this.onVisualViewportResize)
    }

    this.destroyRef.onDestroy(() => {
      host.removeEventListener('focusin', this.onFocusIn, true)
      host.removeEventListener('focusout', this.onFocusOut, true)
      if (this.hasVisualViewport) {
        window.visualViewport?.removeEventListener('resize', this.onVisualViewportResize)
      }
    })
  }

  private onFocusIn = (e: FocusEvent): void => {
    const target = e.target as HTMLElement
    if (!FORM_ELEMENTS.has(target.tagName)) return
    this.activeInput = target
    this.scrollToInput(target)
  }

  private onFocusOut = (): void => {
    this.activeInput = null
  }

  private onVisualViewportResize = (): void => {
    if (this.activeInput) {
      this.scrollToInput(this.activeInput)
    }
  }

  private scrollToInput(target: HTMLElement): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: 'center', behavior: 'smooth' })
      })
    })
  }

  private get hasVisualViewport(): boolean {
    return typeof window !== 'undefined' && 'visualViewport' in window
  }
}
