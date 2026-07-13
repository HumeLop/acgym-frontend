import { HttpClient, type HttpErrorResponse, httpResource } from '@angular/common/http'
import { computed, inject, Service, signal } from '@angular/core'
import { EntityEventBusService } from '@core/services/entity-event-bus-service'
import { environment } from '@environments/environment'
import { toMembershipType } from '@features/admin/adapters/membership-type.adapter'
import { adaptMembershipTypeStats } from '@features/admin/adapters/membership-type-stats.adapter'
import type { MembershipTypeEntity, MembershipTypeRequestDto } from '@features/admin/models'
import type { MembershipType } from '@features/admin/models/membership-type.model'
import type { MembershipTypeStatsEntity } from '@features/admin/models/membership-type-stats.entity'
import type { PaginatedResponse } from '@shared/models'
import { hapticMedium } from '@shared/utils/haptic'
import { TuiNotificationService } from '@taiga-ui/core'
import { catchError, finalize, type Observable, tap, throwError } from 'rxjs'

@Service()
export class MembershipTypeService {
  private http = inject(HttpClient)
  private alerts = inject(TuiNotificationService)
  private entityEvents = inject(EntityEventBusService)
  private apiURL = `${environment.apiURL}/payments/membership-types`

  isModalOpen = signal(false)
  private _isCreating = signal(false)
  private _isEditing = signal(false)
  private _editingId = signal<number | null>(null)

  readonly isCreating = this._isCreating.asReadonly()
  readonly isEditing = this._isEditing.asReadonly()
  readonly editingId = this._editingId.asReadonly()

  private readonly typesResource = httpResource<PaginatedResponse<MembershipTypeEntity>>(() => ({
    url: `${this.apiURL}/`,
    params: { page_size: '50' },
  }))

  readonly types = computed(() => {
    if (this.typesResource.status() === 'error') return []
    return this.typesResource.value()?.results?.map(toMembershipType) ?? []
  })

  readonly totalCount = computed(() => {
    if (this.typesResource.status() === 'error') return 0
    return this.typesResource.value()?.count ?? 0
  })

  readonly isLoading = this.typesResource.isLoading
  readonly error = this.typesResource.error

  create(data: MembershipTypeRequestDto): Observable<MembershipType> {
    this._isCreating.set(true)
    return this.http.post<MembershipType>(`${this.apiURL}/`, data).pipe(
      tap(() => {
        this.typesResource.reload()
        this.entityEvents.notify('membership-type')
        this.isModalOpen.set(false)
        this.alerts.open('Tipo de membresía creado exitosamente').subscribe()
      }),
      catchError((err: HttpErrorResponse) => {
        this.alerts
          .open('Error al crear el tipo de membresía', {
            appearance: 'error',
            label: 'Error',
          })
          .subscribe()
        return throwError(() => err)
      }),
      finalize(() => this._isCreating.set(false))
    )
  }

  update(id: number, data: MembershipTypeRequestDto): Observable<MembershipType> {
    this._isEditing.set(true)
    return this.http.put<MembershipType>(`${this.apiURL}/${id}/`, data).pipe(
      tap(() => {
        this.typesResource.reload()
        this.isModalOpen.set(false)
        this.alerts.open('Tipo de membresía actualizado correctamente').subscribe()
      }),
      catchError((err: HttpErrorResponse) => {
        this.alerts
          .open('Error al actualizar el tipo de membresía', {
            appearance: 'error',
            label: 'Error',
          })
          .subscribe()
        return throwError(() => err)
      }),
      finalize(() => this._isEditing.set(false))
    )
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}/`).pipe(
      tap(() => {
        this.typesResource.reload()
        this.alerts.open('Tipo de membresía eliminado').subscribe()
      }),
      catchError((err: HttpErrorResponse) => {
        this.alerts
          .open('Error al eliminar el tipo de membresía', {
            appearance: 'error',
            label: 'Error',
          })
          .subscribe()
        return throwError(() => err)
      })
    )
  }

  openCreateModal() {
    hapticMedium()
    this._editingId.set(null)
    this.isModalOpen.set(true)
  }

  openEditModal(id: number) {
    hapticMedium()
    this._editingId.set(id)
    this.isModalOpen.set(true)
  }

  closeModal() {
    this.isModalOpen.set(false)
    this._editingId.set(null)
  }

  private detailId = signal<number | null>(null)

  readonly memberTypeDetailResource = httpResource<MembershipTypeEntity>(() => {
    const id = this.detailId()
    return id ? { url: `${this.apiURL}/${id}/` } : undefined
  })

  readonly memberTypeStatsResource = httpResource<MembershipTypeStatsEntity>(() => {
    const id = this.detailId()
    return id ? { url: `${this.apiURL}/${id}/stats/` } : undefined
  })

  readonly detail = computed(() => {
    if (this.memberTypeDetailResource.status() === 'error') return null
    const entity = this.memberTypeDetailResource.value()
    return entity ? toMembershipType(entity) : null
  })

  readonly stats = computed(() => {
    if (this.memberTypeStatsResource.status() === 'error') return null
    const entity = this.memberTypeStatsResource.value()
    return entity ? adaptMembershipTypeStats(entity) : null
  })

  readonly isLoadingDetail = this.memberTypeDetailResource.isLoading
  readonly isLoadingStats = this.memberTypeStatsResource.isLoading
  readonly detailError = this.memberTypeDetailResource.error

  loadMemberTypeDetail(id: number) {
    this.detailId.set(id)
  }

  reload() {
    this.typesResource.reload()
  }
}
