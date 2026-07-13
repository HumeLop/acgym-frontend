import { Component, computed, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { PaymentCard } from '@features/payments/pages/payment-card/payment-card'
import { PaymentForm } from '@features/payments/pages/payment-form/payment-form'
import { PaymentService } from '@features/payments/services/payment-service'
import { Sentinel } from '@shared/directives/sentinel'
import { TuiElasticSticky, TuiResponsiveDialog } from '@taiga-ui/addon-mobile'
import { TuiAutoFocus, tuiClamp } from '@taiga-ui/cdk'
import { TuiButton, TuiIcon, TuiNotification } from '@taiga-ui/core'
import { TuiSegmented, TuiSkeleton } from '@taiga-ui/kit'
import { TuiCardLarge } from '@taiga-ui/layout'

@Component({
  selector: 'app-payments-list',
  imports: [
    TuiIcon,
    TuiButton,
    TuiNotification,
    TuiResponsiveDialog,
    TuiSegmented,
    TuiAutoFocus,
    PaymentCard,
    PaymentForm,
    TuiElasticSticky,
    TuiSkeleton,
    TuiCardLarge,
    Sentinel,
  ],
  templateUrl: './payments-list.html',
})
export class PaymentsList {
  protected router = inject(Router)
  private paymentService = inject(PaymentService)
  protected payments = this.paymentService.payments
  protected totalPayments = this.paymentService.totalPayments
  protected hasPayments = computed(() => (this.payments() ?? []).length > 0)
  protected hasMorePages = computed(() => this.page() * this.pageSize() < this.totalPayments())
  protected page = this.paymentService.page
  protected pageSize = this.paymentService.pageSize
  protected nextPage = this.paymentService.nextPage
  protected previousPage = this.paymentService.previousPage
  protected isLoading = this.paymentService.isLoading
  protected status = this.paymentService.status
  protected error = this.paymentService.error
  protected activeTabIndex = signal(0)
  protected sentinelDisabled = computed(() => this.isLoading() || !this.hasMorePages())

  searchTerm = this.paymentService.searchTerm
  statusFilter = this.paymentService.statusFilter

  isModalOpen = this.paymentService.isModalOpen
  isEditingPayment = this.paymentService.editingPaymentId

  protected startItem = computed(() => {
    return this.totalPayments() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1
  })

  protected endItem = computed(() => {
    const end = this.page() * this.pageSize()
    return end > this.totalPayments() ? this.totalPayments() : end
  })

  protected activeCount = computed(() => this.payments().filter((p) => p.isActive).length)
  protected inactiveCount = computed(() => this.payments().filter((p) => !p.isActive).length)

  protected totalAmount = computed(() => {
    const sum = this.payments().reduce((acc, p) => acc + parseFloat(p.amount || '0'), 0)
    return sum.toFixed(2)
  })

  protected headerScale = signal(1)

  protected onElastic(scale: number): void {
    this.headerScale.set(tuiClamp(scale, 0.6, 1))
  }

  onSearch(value: string) {
    this.paymentService.search(value)
    this.paymentService.resetPage()
  }

  onClearSearch() {
    this.paymentService.search('')
    this.paymentService.resetPage()
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

  closeModal() {
    this.paymentService.closeModal()
  }

  openCreateModal() {
    this.paymentService.openCreateModal()
  }

  onLoadMore() {
    if (!this.isLoading() && this.hasMorePages()) {
      this.paymentService.nextPage()
    }
  }

  reload() {
    this.paymentService.reload()
  }
}
