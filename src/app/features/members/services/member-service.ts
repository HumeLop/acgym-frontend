import { HttpClient, type HttpErrorResponse, httpResource } from '@angular/common/http'
import { computed, effect, inject, Service, signal } from '@angular/core'
import { toMember, toMemberDetail } from '@app/features/members/adapters/member.adapter'
import type {
  MemberDetailEntity,
  MemberEntity,
  MemberFilterParams,
  MemberWriteDto,
  MemberWriteResponseDto,
} from '@app/features/members/models'
import { environment } from '@environments/environment'
import type { ApiValidationError, PaginatedResponse } from '@shared/models'
import { hapticMedium } from '@shared/utils/haptic'
import { TuiNotificationService } from '@taiga-ui/core'
import { catchError, finalize, type Observable, tap, throwError } from 'rxjs'

@Service()
export class MemberService {
  private http = inject(HttpClient)
  private alerts = inject(TuiNotificationService)
  private apiURL = `${environment.apiURL}/members`

  private mutationError = signal<ApiValidationError | null>(null)

  readonly apiErrors = computed(() => this.mutationError()?.fieldErrors ?? {})
  readonly generalError = computed(() => this.mutationError()?.summary ?? null)

  isModalOpen = signal(false)
  private _isCreating = signal<boolean>(false)
  private _isEditing = signal<boolean>(false)
  private _isDeleting = signal<boolean>(false)
  private _editingMemberId = signal<number | null>(null)
  deletingMemberId = signal<number | null>(null)

  readonly isCreating = this._isCreating.asReadonly()
  readonly isEditing = this._isEditing.asReadonly()
  readonly isDeleting = this._isDeleting.asReadonly()
  readonly editingMemberId = this._editingMemberId.asReadonly()

  page = signal<number>(1)
  private _searchTerm = signal('')
  private _statusFilter = signal<boolean | null>(null)
  private _showInactiveResults = signal(false)

  readonly pageSize = signal<number>(20).asReadonly()
  readonly searchTerm = this._searchTerm.asReadonly()
  readonly statusFilter = this._statusFilter.asReadonly()
  readonly showInactiveResults = this._showInactiveResults.asReadonly()
  private _inactiveDays = signal<number>(30)
  private _daysUntilExpiration = signal<number>(7)

  readonly inactiveDays = this._inactiveDays.asReadonly()
  readonly daysUntilExpiration = this._daysUntilExpiration.asReadonly()

  private cachedMembers = signal<MemberEntity[]>([])

  private remoteSearchTerm = signal('')

  private params = computed<MemberFilterParams>(() => {
    const search = this.remoteSearchTerm()
    const status = this.statusFilter()
    return {
      page: this.page(),
      pageSize: this.pageSize(),
      ...(search ? { search } : {}),
      ...(status !== null ? { is_active: status } : {}),
    }
  })

  private inactiveParams = computed<MemberFilterParams>(() => ({
    ...this.params(),
    inactive_since_days: this.inactiveDays(),
  }))

  private expiringParams = computed<MemberFilterParams>(() => ({
    ...this.params(),
    days_until_expiration: this.daysUntilExpiration(),
  }))

  readonly inactiveMembersResource = httpResource<PaginatedResponse<MemberEntity>>(() => {
    if (!this.showInactiveResults()) return undefined
    return {
      url: `${this.apiURL}/`,
      params: this.inactiveParams() as Record<string, string | number | boolean>,
    }
  })

  readonly membersResource = httpResource<PaginatedResponse<MemberEntity>>(() => ({
    url: `${this.apiURL}/`,
    params: this.params() as Record<string, string | number | boolean>,
  }))

  readonly expiringMembersResource = httpResource<PaginatedResponse<MemberEntity>>(() => ({
    url: `${this.apiURL}/`,
    params: this.expiringParams() as Record<string, string | number | boolean>,
  }))

  createMember(member: MemberWriteDto): Observable<MemberWriteResponseDto> {
    this._isCreating.set(true)
    return this.http.post<MemberWriteResponseDto>(`${this.apiURL}/`, member).pipe(
      tap(() => {
        this.membersResource.reload()
        this.isModalOpen.set(false)
        this.alerts.open('Miembro creado exitosamente').subscribe()
      }),
      catchError((err: HttpErrorResponse) => {
        this.mutationError.set(err.error as ApiValidationError)
        return throwError(() => err)
      }),
      finalize(() => {
        this._isCreating.set(false)
      })
    )
  }

  updateMember(id: number, member: MemberWriteDto): Observable<MemberWriteResponseDto> {
    this._isEditing.set(true)
    return this.http.put<MemberWriteResponseDto>(`${this.apiURL}/${id}/`, member).pipe(
      tap(() => {
        this.membersResource.reload()
        this.memberDetailResource.reload()
        this.isModalOpen.set(false)
        this.alerts.open('Miembro actualizado correctamente').subscribe()
      }),
      catchError((err: HttpErrorResponse) => {
        this.mutationError.set(err.error as ApiValidationError)
        return throwError(() => err)
      }),
      finalize(() => {
        this._isEditing.set(false)
      })
    )
  }

  deleteMember(id: number): Observable<void> {
    this._isDeleting.set(true)
    return this.http.delete<void>(`${this.apiURL}/${id}/`).pipe(
      tap(() => {
        this.membersResource.reload()
        this.deletingMemberId.set(null)
        this.alerts.open('Miembro eliminado').subscribe()
      }),
      catchError((err: HttpErrorResponse) => {
        this.mutationError.set(err.error as ApiValidationError)
        return throwError(() => err)
      }),
      finalize(() => {
        this._isDeleting.set(false)
      })
    )
  }

  private localResults = computed(() => {
    const term = this.searchTerm().trim().toLowerCase()
    if (!term) return this.cachedMembers()

    return this.cachedMembers().filter((m) => {
      return (
        m.name.toLowerCase().includes(term) ||
        (m.email?.toLowerCase().includes(term) ?? false) ||
        (m.phone?.toLowerCase().includes(term) ?? false)
      )
    })
  })

  constructor() {
    effect(() => {
      if (this.membersResource.status() === 'error') return
      const results = this.membersResource.value()?.results
      if (results && !this.remoteSearchTerm()) {
        this.cachedMembers.update((prev) => {
          if (this.page() === 1) return results
          const existingIds = new Set(prev.map((m) => m.id))
          const newMembers = results.filter((m) => !existingIds.has(m.id))
          return [...prev, ...newMembers]
        })
      }
    })
  }

  readonly members = computed(() => {
    if (this.membersResource.status() === 'error') {
      return []
    }
    const term = this.searchTerm().trim()
    if (!term) {
      return this.membersResource.value()?.results?.map(toMember) ?? []
    }
    const localTerm = this.localResults()
    if (localTerm.length > 0) {
      return localTerm.map(toMember)
    }

    return this.membersResource.value()?.results?.map(toMember) ?? []
  })

  readonly inactiveMembers = computed(() => {
    if (!this.showInactiveResults()) return []
    if (this.inactiveMembersResource.status() === 'error') return []
    return this.inactiveMembersResource.value()?.results?.map(toMember) ?? []
  })

  readonly expiringMembers = computed(() => {
    if (this.expiringMembersResource.status() === 'error') return []
    return this.expiringMembersResource.value()?.results?.map(toMember) ?? []
  })

  readonly hasInactiveResults = computed(() => {
    if (this.inactiveMembersResource.status() === 'error') return 0
    return this.inactiveMembersResource.value()?.count ?? 0
  })

  readonly inactiveSearchLoading = this.inactiveMembersResource.isLoading
  readonly inactiveSearchError = this.inactiveMembersResource.error

  readonly hasExpiringResults = computed(() => {
    if (this.expiringMembersResource.status() === 'error') return 0
    return this.expiringMembersResource.value()?.count ?? 0
  })

  readonly hasExpiringMembers = computed(() => this.hasExpiringResults() > 0)

  readonly hasLocalResults = computed(() => {
    return this.localResults().length > 0
  })

  readonly hasRemoteResults = computed(() => {
    if (this.membersResource.status() === 'error') return false
    return (this.membersResource.value()?.results?.length ?? 0) > 0
  })

  searchInactive(days: number) {
    this._inactiveDays.set(days)
    this.page.set(1)
    this._showInactiveResults.set(true)
  }

  clearInactiveMembers() {
    this._showInactiveResults.set(false)
  }

  resetPage() {
    this.page.set(1)
  }

  setStatusFilter(filter: boolean | null) {
    this._statusFilter.set(filter)
  }

  search(term: string) {
    this._searchTerm.set(term)

    const trimmed = term.trim()

    if (!trimmed) {
      this.remoteSearchTerm.set('')
      return
    }

    if (this.localResults().length > 0) return

    this.remoteSearchTerm.set(trimmed)
  }

  readonly totalCount = computed(() => {
    if (this.membersResource.status() === 'error') return 0
    return this.membersResource.value()?.count ?? 0
  })
  readonly totalMembers = this.totalCount
  readonly isLoadingMembers = this.membersResource.isLoading
  readonly isLoading = this.isLoadingMembers
  readonly membersError = this.membersResource.error
  readonly error = this.membersError

  nextPage() {
    this.page.update((p) => p + 1)
  }

  previousPage() {
    this.page.update((p) => Math.max(1, p - 1))
  }

  private detailId = signal<number | null>(null)

  readonly memberDetailResource = httpResource<MemberDetailEntity>(() => {
    const id = this.detailId()
    return id ? { url: `${this.apiURL}/${id}/` } : undefined
  })

  readonly memberDetail = computed(() => {
    if (this.memberDetailResource.status() === 'error') return null
    const detail = this.memberDetailResource.value()
    return detail ? toMemberDetail(detail) : null
  })
  readonly isLoadingDetail = this.memberDetailResource.isLoading
  readonly detailError = this.memberDetailResource.error

  loadMemberDetail(id: number) {
    this.detailId.set(id)
  }

  openCreateModal() {
    hapticMedium()
    this.mutationError.set(null)
    this._editingMemberId.set(null)
    this.isModalOpen.set(true)
  }

  openEditModal(id: number) {
    hapticMedium()
    this.mutationError.set(null)
    this._editingMemberId.set(id)
    this.isModalOpen.set(true)
  }

  closeModal() {
    this.isModalOpen.set(false)
    this._editingMemberId.set(null)
    this.deletingMemberId.set(null)
    this.mutationError.set(null)
  }

  clearErrors() {
    this.mutationError.set(null)
  }

  reload() {
    this.membersResource.reload()
  }
}
