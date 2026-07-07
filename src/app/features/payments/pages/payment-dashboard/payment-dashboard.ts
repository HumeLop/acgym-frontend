import { KeyValuePipe } from '@angular/common'
import { Component, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { PaymentForm } from '@features/payments/pages/payment-form/payment-form'
import { PaymentService } from '@features/payments/services/payment-service'
import { TuiResponsiveDialog } from '@taiga-ui/addon-mobile'
import { TuiIcon } from '@taiga-ui/core'
import { TuiSkeleton } from '@taiga-ui/kit'
import { TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-payment-dashboard',
  imports: [RouterLink, TuiResponsiveDialog, TuiIcon, TuiSurface, TuiSkeleton, KeyValuePipe, PaymentForm],
  templateUrl: './payment-dashboard.html',
})
export class PaymentDashboard {
  protected paymentService = inject(PaymentService)

  protected stats = this.paymentService.paymentStats
  protected loading = this.paymentService.isLoadingStats
  protected isModalOpen = this.paymentService.isModalOpen
  protected isEditingPayment = this.paymentService.editingPaymentId
}
