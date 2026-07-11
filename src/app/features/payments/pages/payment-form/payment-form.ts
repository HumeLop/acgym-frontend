import { KeyValuePipe } from '@angular/common'
import { Component, computed, effect, inject, input, linkedSignal, output, signal } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { FormField, form, required } from '@angular/forms/signals'
import type { PaymentWriteDto } from '@features/payments/models'
import { PaymentService } from '@features/payments/services/payment-service'
import type { PaymentMethod } from '@shared/models'
import { ConfirmService } from '@shared/services/confirm-service'
import { DateUtils } from '@shared/utils/date.utils'
import { TuiDay, TuiMonth, type TuiStringHandler, type TuiStringMatcher } from '@taiga-ui/cdk'
import { TuiButton, TuiCalendar, TuiDataList, TuiDropdown, TuiIcon, TuiLabel, TuiNotification } from '@taiga-ui/core'
import { TuiButtonLoading, TuiChevron, TuiComboBox, TuiSelect } from '@taiga-ui/kit'
import { TuiSurface } from '@taiga-ui/layout'

@Component({
  selector: 'app-payment-form',
  imports: [
    ReactiveFormsModule,
    KeyValuePipe,
    TuiIcon,
    TuiButton,
    TuiLabel,
    TuiNotification,
    FormField,
    TuiCalendar,
    TuiSelect,
    TuiChevron,
    TuiComboBox,
    TuiDataList,
    TuiDropdown,
    TuiSurface,
    TuiButtonLoading,
  ],
  templateUrl: './payment-form.html',
})
export class PaymentForm {
  protected paymentService = inject(PaymentService)
  private confirmSvc = inject(ConfirmService)

  paymentId = input<number | null>(null)
  close = output<void>()

  protected calendarOpen = signal(false)
  protected calendarMonth = computed(
    () => new TuiMonth(this.paymentFormModel().payment_date.year, this.paymentFormModel().payment_date.month)
  )

  protected isCreating = this.paymentService.isCreating
  protected isEditing = this.paymentService.isEditing
  protected apiErrors = this.paymentService.apiErrors
  protected generalError = this.paymentService.generalError

  protected editMode = computed(() => this.paymentId() !== null)

  protected paymentMethods: PaymentMethod[] = ['Efectivo', 'Tarjeta', 'Transferencia']

  protected memberOptions = this.paymentService.memberOptions
  protected membershipTypes = this.paymentService.membershipTypes

  // ── FormControls bridge for Taiga UI selects ──
  protected memberControl = new FormControl<number | null>(null)
  protected membershipTypeControl = new FormControl<number | null>(null)
  protected paymentMethodControl = new FormControl<PaymentMethod | null>(null)

  protected memberStringify: TuiStringHandler<number> = (id) =>
    this.memberOptions().find((m) => m.id === id)?.name ?? ''

  protected memberMatcher: TuiStringMatcher<number> = (id, query) => {
    if (String(id) === query) return true
    const name = this.memberOptions().find((m) => m.id === id)?.name
    return name?.toLowerCase() === query.toLowerCase()
  }

  protected membershipTypeStringify: TuiStringHandler<number> = (id) => {
    const mt = this.membershipTypes().find((t) => t.id === id)
    return mt ? `${mt.name} — $${mt.amount}` : ''
  }

  private getEmptyFormData() {
    return {
      member: '',
      membership_type: '',
      amount: 0,
      payment_date: TuiDay.currentLocal(),
      payment_method: 'Efectivo' as PaymentMethod,
      notes: '',
    }
  }

  protected paymentFormModel = linkedSignal(() => {
    const id = this.paymentId()
    if (id === null) return this.getEmptyFormData()

    const payment = this.paymentService.paymentDetail()
    if (!payment || payment.id !== id) return this.getEmptyFormData()

    return {
      member: String(payment.member),
      membership_type: String(payment.membershipType),
      amount: parseFloat(payment.amount) || 0,
      payment_date: DateUtils.toTuiDay(payment.paymentDate),
      payment_method: payment.paymentMethod,
      notes: payment.notes,
    }
  })

  protected paymentForm = form(this.paymentFormModel, (path) => {
    required(path.member, { message: 'Selecciona un miembro' })
    required(path.membership_type, { message: 'Selecciona un tipo de membresía' })
    required(path.payment_method, { message: 'Selecciona un método de pago' })
  })

  protected formatTuiDay(day: TuiDay): string {
    const date = new Date(day.year, day.month, day.day)
    return DateUtils.formatDateForDisplay(date)
  }

  constructor() {
    effect(() => {
      const id = this.paymentId()
      if (id !== null) this.paymentService.loadPaymentDetail(id)
    })

    effect(() => {
      const m = this.paymentFormModel()
      this.memberControl.setValue(m.member ? Number(m.member) : null, { emitEvent: false })
      this.membershipTypeControl.setValue(m.membership_type ? Number(m.membership_type) : null, { emitEvent: false })
      this.paymentMethodControl.setValue(m.payment_method || 'Efectivo', { emitEvent: false })
    })

    effect(() => {
      const types = this.membershipTypes()
      if (types.length === 0) return
      const selectedType = this.paymentFormModel().membership_type
      if (!selectedType) return
      const match = types.find((t) => String(t.id) === selectedType)
      if (match && !this.paymentFormModel().amount) {
        this.paymentFormModel.update((d) => ({ ...d, amount: parseFloat(match.amount) }))
      }
    })

    this.memberControl.valueChanges.subscribe((val) => {
      this.paymentFormModel.update((d) => ({ ...d, member: val != null ? String(val) : '' }))
      this.paymentForm.member().markAsTouched()
    })
    this.membershipTypeControl.valueChanges.subscribe((val) => {
      this.paymentFormModel.update((d) => ({ ...d, membership_type: val != null ? String(val) : '' }))
      this.paymentForm.membership_type().markAsTouched()
    })
    this.paymentMethodControl.valueChanges.subscribe((val) => {
      if (val) {
        this.paymentFormModel.update((d) => ({ ...d, payment_method: val as PaymentMethod }))
      }
      this.paymentForm.payment_method().markAsTouched()
    })
  }

  onMembershipTypeChange(id: number) {
    const match = this.membershipTypes().find((t) => t.id === id)
    if (match) {
      this.paymentFormModel.update((d) => ({ ...d, amount: parseFloat(match.amount) }))
    }
  }

  onDateChange(day: TuiDay) {
    this.paymentFormModel.update((d) => ({ ...d, payment_date: day }))
    this.calendarOpen.set(false)
  }

  onCancel() {
    this.confirmSvc
      .open({
        title: this.isEditing() ? 'Descartar Cambios' : 'Cancelar Registro',
        message: this.isEditing() ? 'Los cambios no guardados se perderán' : 'La información ingresada se perderá',
        type: 'destructive',
        confirmText: 'Sí, Descartar',
        cancelText: 'No, Quedarme',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.paymentForm().reset()
          this.close.emit()
        }
      })
  }

  onSave() {
    if (this.paymentForm().invalid()) {
      this.paymentForm.member().markAsTouched()
      this.paymentForm.membership_type().markAsTouched()
      this.paymentForm.payment_method().markAsTouched()
      return
    }

    const data = this.paymentFormModel()

    const dto: PaymentWriteDto = {
      member: Number(data.member),
      membership_type: Number(data.membership_type),
      amount: String(data.amount),
      payment_date: DateUtils.fromTuiDay(data.payment_date) ?? undefined,
      payment_method: data.payment_method,
      notes: data.notes || undefined,
    }

    if (this.editMode()) {
      const id = this.paymentId()
      if (id === null) return
      this.paymentService.updatePayment(id, dto).subscribe({
        next: () => {
          this.paymentForm().reset()
          this.close.emit()
        },
      })
    } else {
      this.paymentService.createPayment(dto).subscribe({
        next: () => {
          this.paymentForm().reset()
          this.close.emit()
        },
      })
    }
  }
}
