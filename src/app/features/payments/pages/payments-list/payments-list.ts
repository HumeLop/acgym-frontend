import { Component, computed, effect, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { PaymentCard } from '@features/payments/pages/payment-card/payment-card'
import { PaymentForm } from '@features/payments/pages/payment-form/payment-form'
import { PaymentService } from '@features/payments/services/payment-service'
import { WA_IS_ANDROID, WA_IS_IOS } from '@ng-web-apis/platform'
import { ConfirmationModal } from '@shared/components/confirmation-modal/confirmation-modal'
import {
  TUI_ANDROID_LOADER,
  TUI_PULL_TO_REFRESH_COMPONENT,
  TUI_PULL_TO_REFRESH_LOADED,
  TuiPullToRefresh,
  TuiResponsiveDialog,
  TuiRipple,
} from '@taiga-ui/addon-mobile'
import { TuiAutoFocus } from '@taiga-ui/cdk'
import { TuiIcon } from '@taiga-ui/core'
import { TuiTabs } from '@taiga-ui/kit'
import { Subject } from 'rxjs'

@Component({
  selector: 'app-payments-list',
  imports: [
    TuiIcon,
    ConfirmationModal,
    TuiResponsiveDialog,
    TuiPullToRefresh,
    TuiTabs,
    TuiAutoFocus,
    TuiRipple,
    PaymentCard,
    PaymentForm,
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
  ],
  templateUrl: './payments-list.html',
  styleUrl: './payments-list.css',
})
export class PaymentsList {
  protected router = inject(Router)
  protected paymentService = inject(PaymentService)
  protected payments = this.paymentService.payments
  protected totalPayments = this.paymentService.totalPayments
  protected hasPayments = computed(() => (this.payments() ?? []).length > 0)
  protected page = this.paymentService.page
  protected pageSize = this.paymentService.pageSize
  protected nextPage = this.paymentService.nextPage
  protected previousPage = this.paymentService.previousPage
  protected isLoading = this.paymentService.isLoading
  protected isDeleting = this.paymentService.isDeleting
  protected error = this.paymentService.error
  protected showDeleteConfirmation = signal(false)
  protected activeTabIndex = signal(0)

  searchTerm = this.paymentService.searchTerm
  statusFilter = this.paymentService.statusFilter

  isModalOpen = this.paymentService.isModalOpen
  isEditingMember = this.paymentService.editingPaymentId

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

  onSearch(value: string) {
    this.paymentService.search(value)
    this.paymentService.page.set(1)
  }

  onClearSearch() {
    this.paymentService.search('')
    this.paymentService.page.set(1)
  }

  onDeletePayment(id: number) {
    this.paymentService.deletingPaymentId.set(id)
    this.showDeleteConfirmation.set(true)
  }

  onConfirmDelete() {
    const id = this.paymentService.deletingPaymentId()
    if (id === null) return
    this.paymentService.deletePayment(id).subscribe({
      next: () => {
        this.showDeleteConfirmation.set(false)
      },
    })
  }

  onCancelDelete() {
    this.showDeleteConfirmation.set(false)
    this.paymentService.deletingPaymentId.set(null)
  }

  closeModal() {
    this.paymentService.closeModal()
  }

  onTabChange(index: number) {
    this.activeTabIndex.set(index)
    this.paymentService.page.set(1)

    if (index === 1) {
      this.paymentService.statusFilter.set('active')
    } else if (index === 2) {
      this.paymentService.statusFilter.set('expired')
    } else {
      this.paymentService.statusFilter.set(null)
    }

    this.paymentService.reload()
  }

  private readonly pullEffect = effect(() => {
    if (this.isPulling() && !this.paymentService.isLoading()) {
      this.loaded$.next()
      this.isPulling.set(false)
    }
  })

  protected onPull() {
    if (window.scrollY > 1) return

    this.paymentService.page.set(1)
    this.paymentService.reload()
    this.isPulling.set(true)
  }
}
