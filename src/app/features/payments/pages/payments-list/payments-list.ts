import { Component, computed, effect, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { PaymentCard } from '@features/payments/pages/payment-card/payment-card'
import { PaymentForm } from '@features/payments/pages/payment-form/payment-form'
import { PaymentService } from '@features/payments/services/payment-service'
import { WA_IS_ANDROID, WA_IS_IOS } from '@ng-web-apis/platform'
import { ConfirmService } from '@shared/services/confirm-service'
import { Sentinel } from '@shared/directives/sentinel'
import {
  TUI_ANDROID_LOADER,
  TUI_PULL_TO_REFRESH_COMPONENT,
  TUI_PULL_TO_REFRESH_LOADED,
  TUI_PULL_TO_REFRESH_THRESHOLD,
  TuiElasticSticky,
  TuiPullToRefresh,
  TuiResponsiveDialog,
  TuiRipple,
} from '@taiga-ui/addon-mobile'
import { TuiAutoFocus, tuiClamp } from '@taiga-ui/cdk'
import { TuiButton, TuiIcon, TuiNotification } from '@taiga-ui/core'
import { TuiSegmented, TuiSkeleton } from '@taiga-ui/kit'
import { TuiCardLarge } from '@taiga-ui/layout'
import { Subject } from 'rxjs'

@Component({
  selector: 'app-payments-list',
  imports: [
    TuiIcon,
    TuiButton,
    TuiNotification,
    TuiResponsiveDialog,
    TuiPullToRefresh,
    TuiSegmented,
    TuiAutoFocus,
    TuiRipple,
    PaymentCard,
    PaymentForm,
    TuiElasticSticky,
    TuiSkeleton,
    TuiCardLarge,
    Sentinel,
  ],
  providers: [
    {
      provide: TUI_PULL_TO_REFRESH_LOADED,
      useClass: Subject,
    },
    {
      provide: TUI_PULL_TO_REFRESH_COMPONENT,
      useValue: TUI_ANDROID_LOADER,
    },
    {
      provide: WA_IS_ANDROID,
      useValue: true,
    },
    {
      provide: WA_IS_IOS,
      useValue: true,
    },
    {
      provide: TUI_PULL_TO_REFRESH_THRESHOLD,
      useValue: 120,
    },
  ],
  templateUrl: './payments-list.html',
})
export class PaymentsList {
  protected router = inject(Router)
  private paymentService = inject(PaymentService)
  private readonly confirmSvc = inject(ConfirmService)
  private readonly isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  protected payments = this.paymentService.payments
  protected totalPayments = this.paymentService.totalPayments
  protected hasPayments = computed(() => (this.payments() ?? []).length > 0)
  protected page = this.paymentService.page
  protected pageSize = this.paymentService.pageSize
  protected nextPage = this.paymentService.nextPage
  protected previousPage = this.paymentService.previousPage
  protected isLoading = this.paymentService.isLoading
  protected status = this.paymentService.status
  protected isDeleting = this.paymentService.isDeleting
  protected error = this.paymentService.error
  protected activeTabIndex = signal(0)

  searchTerm = this.paymentService.searchTerm
  statusFilter = this.paymentService.statusFilter

  isModalOpen = this.paymentService.isModalOpen
  isEditingPayment = this.paymentService.editingPaymentId

  protected mutationError = this.paymentService.generalError

  private readonly loaded$ = inject<Subject<void>>(TUI_PULL_TO_REFRESH_LOADED)
  private readonly isPulling = signal(false)

  startItem = computed(() => {
    return this.totalPayments() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1
  })

  endItem = computed(() => {
    const end = this.page() * this.pageSize()
    return end > this.totalPayments() ? this.totalPayments() : end
  })

  protected activeCount = computed(() => this.payments().filter((p) => p.isActive).length)

  protected inactiveCount = computed(() => this.payments().filter((p) => !p.isActive).length)

  protected totalAmount = computed(() => {
    const sum = this.payments().reduce((acc, p) => acc + parseFloat(p.amount || '0'), 0)
    return sum.toFixed(2)
  })

  constructor() {
    effect(() => {
      if (this.isPulling() && !this.paymentService.isLoading()) {
        this.loaded$.next()
        this.isPulling.set(false)
      }
    })
  }
  onSearch(value: string) {
    this.paymentService.search(value)
    this.paymentService.resetPage()
  }

  onClearSearch() {
    this.paymentService.search('')
    this.paymentService.resetPage()
  }

  onDeletePayment(id: number) {
    this.confirmSvc
      .open({
        title: 'Eliminar pago',
        message: '¿Estás seguro de eliminar este pago?',
        type: 'destructive',
        confirmText: 'Eliminar',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.paymentService.deletingPaymentId.set(id)
          this.paymentService.deletePayment(id).subscribe()
        }
      })
  }

  closeModal() {
    this.paymentService.closeModal()
  }

  onTabChange(index: number) {
    this.activeTabIndex.set(index)
    this.paymentService.resetPage()

    if (index === 1) {
      this.paymentService.setStatusFilter('active')
    } else if (index === 2) {
      this.paymentService.setStatusFilter('expired')
    } else {
      this.paymentService.setStatusFilter(null)
    }

    this.paymentService.reload()
  }

  protected headerScale = signal(1)

  protected onElastic(scale: number): void {
    this.headerScale.set(tuiClamp(scale, 0.6, 1))
  }

  protected onPull() {
    if (window.scrollY > 0) return
    if (!this.isTouchDevice) return

    this.paymentService.resetPage()
    this.paymentService.reload()
    this.isPulling.set(true)
  }

  protected reload() {
    this.paymentService.reload()
  }

  protected openEditModal(id: number) {
    this.paymentService.openEditModal(id)
  }

  protected openCreateModal() {
    this.paymentService.openCreateModal()
  }

  protected onLoadMore() {
    if (!this.isLoading()) {
      this.paymentService.nextPage()
    }
  }
}
