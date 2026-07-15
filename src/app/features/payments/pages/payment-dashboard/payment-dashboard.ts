import { KeyValuePipe } from '@angular/common'
import { Component, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AuthService } from '@features/auth/services/auth-service'
import { PaymentForm } from '@features/payments/pages/payment-form/payment-form'
import { PaymentService } from '@features/payments/services/payment-service'
import {
  TuiResponsiveDialog,
  TuiRipple,
} from '@taiga-ui/addon-mobile'
import { TuiIcon } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-payment-dashboard',
  imports: [
    RouterLink,
    TuiResponsiveDialog,
    TuiIcon,
    TuiSurface,
    TuiSkeleton,
    KeyValuePipe,
    PaymentForm,
    TuiRipple,
  ],
  templateUrl: './payment-dashboard.html',
})
export class PaymentDashboard {
  private paymentService = inject(PaymentService)
  private authService = inject(AuthService)

  protected isAdmin = this.authService.isAdmin
  protected stats = this.paymentService.paymentStats
  protected loading = this.paymentService.isLoadingStats
  protected isModalOpen = this.paymentService.isModalOpen
  protected isEditingPayment = this.paymentService.editingPaymentId

  protected openCreateModal() {
    this.paymentService.openCreateModal()
  }

  protected closeModal() {
    this.paymentService.closeModal()
  }
}
