import { HttpClient, type HttpErrorResponse, httpResource } from '@angular/common/http'
import { computed, effect, inject, Service, signal } from '@angular/core'
import { environment } from '@environments/environment'
import { toMembershipType } from '@features/membership-type/adapters/membership-type.adapter'
import type { MembershipTypeEntity } from '@features/membership-type/models'
import { toPaymentDetail, toPaymentStats, toPayments } from '@features/payments/adapters/payment.adapter'
import type {
  PaymentDetailEntity,
  PaymentEntity,
  PaymentFilterParams,
  PaymentStatsEntity,
  PaymentWriteDto,
} from '@features/payments/models'
import type { ApiValidationError, PaginatedResponse } from '@shared/models'
import { TuiNotificationService } from '@taiga-ui/core'
import { catchError, finalize, type Observable, tap, throwError } from 'rxjs'

@Service()
export class PaymentService {
  private http = inject(HttpClient)
  private alerts = inject(TuiNotificationService)
  private apiURL = `${environment.apiURL}/payments`

  private mutationError = signal<ApiValidationError | null>(null)

  private detailId = signal<number | null>(null)

  readonly apiErrors = computed(() => this.mutationError()?.fieldErrors ?? {})
  readonly generalError = computed(() => this.mutationError()?.summary ?? null)

  page = signal<number>(1)
  pageSize = signal<number>(20)
  searchTerm = signal('')
  statusFilter = signal<string | null>(null)

  isModalOpen = signal(false)
  isCreating = signal<boolean>(false)
  isEditing = signal<boolean>(false)
  isDeleting = signal<boolean>(false)
  editingPaymentId = signal<number | null>(null)
  deletingPaymentId = signal<number | null>(null)

  private cachedPayments = signal<PaymentEntity[]>([])

  private remoteSearchTerm = signal('')

  private params = computed<PaymentFilterParams>(() => {
    const search = this.remoteSearchTerm()
    const status = this.statusFilter()
    return {
      page: this.page(),
      page_size: this.pageSize(),
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    }
  })

  readonly paymentsResource = httpResource<PaginatedResponse<PaymentEntity>>(() => ({
    url: `${this.apiURL}/`,
    params: this.params() as Record<string, string | number | boolean>,
  }))

  readonly paymentDetailResource = httpResource<PaymentDetailEntity>(() => {
    const id = this.detailId()
    return id ? { url: `${this.apiURL}/${id}/` } : undefined
  })

  readonly paymentStatsResource = httpResource<PaymentStatsEntity>(() => ({
    url: `${this.apiURL}/stats/`,
  }))

  private memberOptionsResource = httpResource<PaginatedResponse<{ id: number; name: string }>>(() => ({
    url: `${environment.apiURL}/members/options/`,
    params: { page_size: '500' },
  }))

  private cachedMemberOptions = signal<{ id: number; name: string }[]>([])

  private memberSearchTerm = signal('')

  private memberRemoteSearchTerm = signal('')

  private memberRemoteSearchResource = httpResource<PaginatedResponse<{ id: number; name: string }>>(() => {
    const search = this.memberRemoteSearchTerm()
    if (!search) return undefined
    return {
      url: `${environment.apiURL}/members/options/`,
      params: { search, page_size: '20' },
    }
  })

  private localMemberResults = computed(() => {
    const term = this.memberSearchTerm().trim().toLowerCase()
    if (!term) return this.cachedMemberOptions()
    return this.cachedMemberOptions().filter((m) => m.name.toLowerCase().includes(term))
  })

  readonly memberOptions = computed(() => {
    const term = this.memberSearchTerm().trim()
    if (!term) {
      if (this.memberOptionsResource.status() === 'error') return []
      return this.memberOptionsResource.value()?.results ?? []
    }
    const local = this.localMemberResults()
    if (local.length > 0) return local
    if (this.memberRemoteSearchResource.status() === 'error') return local
    return this.memberRemoteSearchResource.value()?.results ?? local
  })

  private _memberCacheEffect = effect(() => {
    if (this.memberOptionsResource.status() === 'error') return
    const results = this.memberOptionsResource.value()?.results
    if (results && !this.memberSearchTerm()) {
      this.cachedMemberOptions.update((prev) => {
        if (prev.length === 0) return results
        const existingIds = new Set(prev.map((m) => m.id))
        const newMembers = results.filter((m) => !existingIds.has(m.id))
        return [...prev, ...newMembers]
      })
    }
  })

  searchMembers(term: string) {
    const trimmed = term.trim()
    this.memberSearchTerm.set(trimmed)

    if (!trimmed) {
      this.memberRemoteSearchTerm.set('')
      return
    }

    if (this.localMemberResults().length > 0) return

    this.memberRemoteSearchTerm.set(trimmed)
  }

  private membershipTypesResource = httpResource<PaginatedResponse<MembershipTypeEntity>>(() => ({
    url: `${this.apiURL}/membership-types/`,
    params: { page_size: '50' },
  }))

  readonly membershipTypes = computed(() => {
    if (this.membershipTypesResource.status() === 'error') return []
    return this.membershipTypesResource.value()?.results?.map(toMembershipType) ?? []
  })

  deletePayment(id: number): Observable<void> {
    this.isDeleting.set(true)
    return this.http.delete<void>(`${this.apiURL}/${id}/`).pipe(
      tap(() => {
        this.paymentsResource.reload()
        this.deletingPaymentId.set(null)
        this.alerts.open('Pago eliminado').subscribe()
      }),
      catchError((err: HttpErrorResponse) => {
        this.mutationError.set(err.error as ApiValidationError)
        this.alerts.open('Error al eliminar el pago', { appearance: 'error' }).subscribe()
        return throwError(() => err)
      }),
      finalize(() => {
        this.isDeleting.set(false)
      })
    )
  }

  createPayment(payment: PaymentWriteDto): Observable<PaymentEntity> {
    this.isCreating.set(true)
    return this.http.post<PaymentEntity>(`${this.apiURL}/`, payment).pipe(
      tap(() => {
        this.paymentsResource.reload()
        this.isModalOpen.set(false)
        this.alerts.open('Pago registrado exitosamente').subscribe()
      }),
      catchError((err: HttpErrorResponse) => {
        this.mutationError.set(err.error as ApiValidationError)
        return throwError(() => err)
      }),
      finalize(() => {
        this.isCreating.set(false)
      })
    )
  }

  updatePayment(id: number, payment: PaymentWriteDto): Observable<PaymentEntity> {
    this.isEditing.set(true)
    return this.http.put<PaymentEntity>(`${this.apiURL}/${id}/`, payment).pipe(
      tap(() => {
        this.paymentsResource.reload()
        this.paymentDetailResource.reload()
        this.isModalOpen.set(false)
        this.alerts.open('Pago actualizado correctamente').subscribe()
      }),
      catchError((err: HttpErrorResponse) => {
        this.mutationError.set(err.error as ApiValidationError)
        return throwError(() => err)
      }),
      finalize(() => {
        this.isEditing.set(false)
      })
    )
  }

  private localResults = computed(() => {
    const term = this.searchTerm().trim().toLowerCase()
    if (!term) return this.cachedPayments()

    return this.cachedPayments().filter((p) => {
      return p.member_name.toLowerCase().includes(term) || (p.payment_method?.toLowerCase().includes(term) ?? false)
    })
  })

  private readonly _cacheEffect = effect(() => {
    if (this.paymentsResource.status() === 'error') return
    const results = this.paymentsResource.value()?.results
    if (results && !this.remoteSearchTerm()) {
      this.cachedPayments.update((prev) => {
        if (this.page() === 1) return results
        const existingIds = new Set(prev.map((p) => p.id))
        const newPayments = results.filter((p) => !existingIds.has(p.id))
        return [...prev, ...newPayments]
      })
    }
  })

  readonly payments = computed(() => {
    if (this.paymentsResource.status() === 'error') {
      return []
    }
    const term = this.searchTerm().trim()
    if (!term) {
      const results = this.paymentsResource.value()?.results ?? []
      return toPayments(results)
    }
    const localTerm = this.localResults()
    if (localTerm.length > 0) {
      return toPayments(localTerm)
    }

    const results = this.paymentsResource.value()?.results ?? []
    return toPayments(results)
  })

  readonly paymentDetail = computed(() => {
    if (this.paymentDetailResource.status() === 'error') {
      return null
    }
    const detail = this.paymentDetailResource.value()
    return detail ? toPaymentDetail(detail) : null
  })

  readonly paymentStats = computed(() => {
    if (this.paymentStatsResource.status() === 'error') {
      return null
    }
    const stats = this.paymentStatsResource.value()
    return stats ? toPaymentStats(stats) : null
  })

  search(term: string) {
    this.searchTerm.set(term)

    const trimmed = term.trim()

    if (!trimmed) {
      this.remoteSearchTerm.set('')
      return
    }

    if (this.localResults().length > 0) return

    this.remoteSearchTerm.set(trimmed)
  }

  readonly totalCount = computed(() => {
    if (this.paymentsResource.status() === 'error') return 0
    return this.paymentsResource.value()?.count ?? 0
  })
  readonly totalPayments = this.totalCount
  readonly isLoadingPayments = this.paymentsResource.isLoading
  readonly isLoading = this.isLoadingPayments
  readonly paymentsStatus = this.paymentsResource.status
  readonly status = this.paymentsStatus
  readonly paymentsError = this.paymentsResource.error
  readonly error = this.paymentsError

  // Detail payment
  readonly isLoadingDetail = this.paymentDetailResource.isLoading
  readonly detailError = this.paymentDetailResource.error

  // Stast payment
  readonly isLoadingStats = this.paymentStatsResource.isLoading
  readonly statsError = this.paymentStatsResource.error

  loadPaymentDetail(id: number) {
    this.detailId.set(id)
  }

  nextPage() {
    this.page.update((p) => p + 1)
  }

  previousPage() {
    this.page.update((p) => Math.max(1, p - 1))
  }

  openCreateModal() {
    this.mutationError.set(null)
    this.editingPaymentId.set(null)
    this.isModalOpen.set(true)
  }

  openEditModal(id: number) {
    this.mutationError.set(null)
    this.editingPaymentId.set(id)
    this.isModalOpen.set(true)
  }

  closeModal() {
    this.isModalOpen.set(false)
    this.editingPaymentId.set(null)
    this.deletingPaymentId.set(null)
    this.mutationError.set(null)
  }

  clearErrors() {
    this.mutationError.set(null)
  }

  reload() {
    this.paymentsResource.reload()
  }
}
