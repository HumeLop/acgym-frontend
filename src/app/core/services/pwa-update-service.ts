import { ApplicationRef, DestroyRef, inject, Service, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import type { VersionReadyEvent } from '@angular/service-worker'
import { SwUpdate } from '@angular/service-worker'
import { concat, filter, first, interval } from 'rxjs'

export interface UpdateStatus {
  type: 'checking' | 'available' | 'activated' | 'no-update' | 'error'
  message?: string
}

@Service()
export class PwaUpdateService {
  private swUpdate = inject(SwUpdate)
  private appRef = inject(ApplicationRef)
  private destroyRef = inject(DestroyRef)

  private _updateStatus = signal<UpdateStatus>({ type: 'no-update' })
  private _isUpdateAvailable = signal(false)
  private _isUpdating = signal(false)

  readonly updateStatus = this._updateStatus.asReadonly()
  readonly isUpdateAvailable = this._isUpdateAvailable.asReadonly()
  readonly isUpdating = this._isUpdating.asReadonly()

  constructor() {
    if (this.swUpdate.isEnabled) {
      this.initializeUpdateChecks()
      this.listenForUpdates()
      this.handleUnrecoverableState()
    }
  }

  private initializeUpdateChecks(): void {
    const appIsStable$ = this.appRef.isStable.pipe(first((isStable) => isStable === true))

    const everyHour$ = interval(60 * 60 * 1000)
    const periodicChecks$ = concat(appIsStable$, everyHour$)

    periodicChecks$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.checkForUpdate()
    })
  }

  async checkForUpdate(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) return false

    try {
      this._updateStatus.set({ type: 'checking', message: 'Buscando actualizaciones...' })
      const updateFound = await this.swUpdate.checkForUpdate()

      if (!updateFound) {
        this._updateStatus.set({ type: 'no-update', message: 'La aplicacion esta actualizada' })
      }

      return updateFound
    } catch {
      this._updateStatus.set({ type: 'error', message: 'Error al verificar actualizaciones' })
      return false
    }
  }

  private listenForUpdates(): void {
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this._isUpdateAvailable.set(true)
        this._updateStatus.set({ type: 'available', message: 'Nueva version disponible' })
      })

    this.swUpdate.versionUpdates
      .pipe(
        filter((evt) => evt.type === 'NO_NEW_VERSION_DETECTED'),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this._updateStatus.set({ type: 'no-update' })
      })
  }

  async activateUpdate(): Promise<void> {
    if (!this.swUpdate.isEnabled) return

    try {
      this._isUpdating.set(true)
      this._updateStatus.set({ type: 'activated', message: 'Activando actualizacion...' })

      await this.swUpdate.activateUpdate()

      setTimeout(() => {
        document.location.reload()
      }, 500)
    } catch {
      this._updateStatus.set({ type: 'error', message: 'Error al activar la actualizacion' })
      this._isUpdating.set(false)
    }
  }

  private handleUnrecoverableState(): void {
    this.swUpdate.unrecoverable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      console.error('Service Worker en estado irrecuperable:', event.reason)
      if (confirm('La aplicacion necesita recargarse para funcionar correctamente.\nRecargar ahora?')) {
        document.location.reload()
      }
    })
  }

  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((name) => caches.delete(name)))
    }
  }

  async getServiceWorkerInfo(): Promise<{ active: boolean; version?: string; state?: string }> {
    if (!('serviceWorker' in navigator)) return { active: false }

    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) return { active: false }

    return {
      active: true,
      state: registration.active?.state,
      version: await this.getCurrentVersion(),
    }
  }

  private async getCurrentVersion(): Promise<string | undefined> {
    try {
      const response = await fetch('/ngsw.json')
      const data = await response.json()
      return data.configVersion || data.timestamp
    } catch {
      return undefined
    }
  }
}
