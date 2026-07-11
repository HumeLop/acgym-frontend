import { HttpClient, type HttpErrorResponse, httpResource } from '@angular/common/http'
import { computed, inject, Service, signal } from '@angular/core'
import { environment } from '@environments/environment'
import { toUser } from '@features/admin/adapters/user.adapter'
import type { UserEntity, UserRequestDto } from '@features/admin/models'
import type { User } from '@features/admin/models/user.model'
import type { PaginatedResponse } from '@shared/models'
import { hapticMedium } from '@shared/utils/haptic'
import { TuiNotificationService } from '@taiga-ui/core'
import { catchError, finalize, type Observable, tap, throwError } from 'rxjs'

@Service()
export class UserService {
  private http = inject(HttpClient)
  private alerts = inject(TuiNotificationService)
  private apiURL = `${environment.apiURL}/users`

  isModalOpen = signal(false)
  private _isCreating = signal(false)
  private _isEditing = signal(false)
  private _editingId = signal<number | null>(null)

  readonly isCreating = this._isCreating.asReadonly()
  readonly isEditing = this._isEditing.asReadonly()
  readonly editingId = this._editingId.asReadonly()

  private readonly usersResource = httpResource<PaginatedResponse<UserEntity>>(() => ({
    url: `${this.apiURL}/`,
    params: { page_size: '50' },
  }))

  readonly users = computed(() => {
    if (this.usersResource.status() === 'error') return []
    return this.usersResource.value()?.results?.map(toUser) ?? []
  })

  readonly totalCount = computed(() => {
    if (this.usersResource.status() === 'error') return 0
    return this.usersResource.value()?.count ?? 0
  })

  readonly isLoading = this.usersResource.isLoading
  readonly error = this.usersResource.error

  private detailId = signal<number | null>(null)

  readonly userDetailResource = httpResource<UserEntity>(() => {
    const id = this.detailId()
    return id ? { url: `${this.apiURL}/${id}/` } : undefined
  })

  readonly detail = computed(() => {
    if (this.userDetailResource.status() === 'error') return null
    const entity = this.userDetailResource.value()
    return entity ? toUser(entity) : null
  })

  readonly isLoadingDetail = this.userDetailResource.isLoading
  readonly detailError = this.userDetailResource.error

  create(data: UserRequestDto): Observable<User> {
    this._isCreating.set(true)
    return this.http.post<User>(`${this.apiURL}/register/`, data).pipe(
      tap(() => {
        this.usersResource.reload()
        this.isModalOpen.set(false)
        this.alerts.open('Usuario creado exitosamente').subscribe()
      }),
      catchError((err: HttpErrorResponse) => {
        this.alerts
          .open('Error al crear el usuario', {
            appearance: 'error',
            label: 'Error',
          })
          .subscribe()
        return throwError(() => err)
      }),
      finalize(() => this._isCreating.set(false))
    )
  }

  update(id: number, data: UserRequestDto): Observable<User> {
    this._isEditing.set(true)
    return this.http.put<User>(`${this.apiURL}/${id}/`, data).pipe(
      tap(() => {
        this.usersResource.reload()
        this.userDetailResource.reload()
        this.isModalOpen.set(false)
        this.alerts.open('Usuario actualizado correctamente').subscribe()
      }),
      catchError((err: HttpErrorResponse) => {
        this.alerts
          .open('Error al actualizar el usuario', {
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
        this.usersResource.reload()
        this.alerts.open('Usuario eliminado').subscribe()
      }),
      catchError((err: HttpErrorResponse) => {
        this.alerts
          .open('Error al eliminar el usuario', {
            appearance: 'error',
            label: 'Error',
          })
          .subscribe()
        return throwError(() => err)
      })
    )
  }

  loadUserDetail(id: number) {
    this.detailId.set(id)
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

  reload() {
    this.usersResource.reload()
  }
}
