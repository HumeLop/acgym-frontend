import { Component, effect, inject, input, linkedSignal, output } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { form, required } from '@angular/forms/signals'
import type { PaymentRenewalDto } from '@features/payments/models'
import { PaymentService } from '@features/payments/services/payment-service'
import type { PaymentMethod } from '@shared/models'
import { TuiButton, TuiDataList, TuiDropdown, TuiIcon, TuiLabel, TuiNotification } from '@taiga-ui/core'
import { TuiButtonLoading, TuiChevron, TuiSelect } from '@taiga-ui/kit'
import { TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-payment-renew',
  imports: [
    ReactiveFormsModule,
    TuiIcon,
    TuiButton,
    TuiLabel,
    TuiNotification,
    TuiSelect,
    TuiChevron,
    TuiDataList,
    TuiDropdown,
    TuiSurface,
    TuiButtonLoading,
  ],
  templateUrl: './payment-renew.html',
})
export class PaymentRenew {
  private paymentService = inject(PaymentService)

  memberId = input.required<number>()
  memberName = input<string>('')
  membershipTypeId = input<number | null>(null)
  close = output<void>()

  protected membershipTypeControl = new FormControl<number | null>(null)
  protected paymentMethodControl = new FormControl<PaymentMethod | null>(null)

  protected membershipTypes = this.paymentService.membershipTypes
  protected isRenewing = this.paymentService.isRenewing
  protected apiErrors = this.paymentService.apiErrors
  protected generalError = this.paymentService.generalError

  protected paymentMethods: PaymentMethod[] = ['Efectivo', 'Tarjeta', 'Transferencia']

  protected membershipTypeStringify = (id: number) => {
    const mt = this.membershipTypes().find((t) => t.id === id)
    return mt ? `${mt.name} — $${mt.amount}` : ''
  }

  protected renewFormModel = linkedSignal(() => ({
    membership_type: this.membershipTypeId() ? String(this.membershipTypeId()) : '',
    payment_method: 'Efectivo' as PaymentMethod,
  }))

  protected renewForm = form(this.renewFormModel, (path) => {
    required(path.membership_type, { message: 'Selecciona un tipo de membresía' })
    required(path.payment_method, { message: 'Selecciona un método de pago' })
  })

  constructor() {
    effect(() => {
      const m = this.renewFormModel()
      this.membershipTypeControl.setValue(m.membership_type ? Number(m.membership_type) : null, {
        emitEvent: false,
      })
      this.paymentMethodControl.setValue(m.payment_method || 'Efectivo', { emitEvent: false })
    })

    this.membershipTypeControl.valueChanges.subscribe((val) => {
      this.renewFormModel.update((d) => ({ ...d, membership_type: val != null ? String(val) : '' }))
      this.renewForm.membership_type().markAsTouched()
    })

    this.paymentMethodControl.valueChanges.subscribe((val) => {
      if (val) {
        this.renewFormModel.update((d) => ({ ...d, payment_method: val as PaymentMethod }))
      }
      this.renewForm.payment_method().markAsTouched()
    })
  }

  onCancel() {
    this.paymentService.clearErrors()
    this.close.emit()
  }

  onRenew() {
    if (this.renewForm().invalid()) {
      this.renewForm.membership_type().markAsTouched()
      this.renewForm.payment_method().markAsTouched()
      return
    }

    const data = this.renewFormModel()
    const dto: PaymentRenewalDto = {
      member: this.memberId(),
      membership_type: Number(data.membership_type),
      payment_method: data.payment_method,
    }

    this.paymentService.renewPayment(dto).subscribe({
      next: () => {
        this.close.emit()
      },
    })
  }
}
