import type { PaymentDetailEntity, PaymentListEntity, PaymentStatsEntity } from '../models/payment.entity'
import type { Payment, PaymentDetail, PaymentStats } from '../models/payment.model'

export function toPayment(entity: PaymentListEntity): Payment {
  return {
    id: entity.id,
    member: entity.member,
    memberName: entity.member_name,
    membershipType: entity.membership_type,
    membershipTypeName: entity.membership_type_name,
    amount: entity.amount,
    paymentDate: entity.payment_date,
    paymentMethod: entity.payment_method,
    startDate: entity.start_date,
    endDate: entity.end_date,
    isActive: entity.is_active,
  }
}

export function toPaymentStats(entity: PaymentStatsEntity): PaymentStats {
  return {
    totalPayments: entity.total_payments,
    totalAmount: entity.total_amount,
    activePayments: entity.active_payments,
    expiredPayments: entity.expired_payments,
    expiringSoon: entity.expiring_soon,
    byMethod: entity.by_method,
    amountByMethod: entity.amount_by_method,
    averagePayment: entity.average_payment,
  }
}

export function toPaymentDetail(entity: PaymentDetailEntity): PaymentDetail {
  return {
    ...toPayment(entity),
    memberEmail: entity.member_email,
    memberPhone: entity.member_phone,
    memberStatus: entity.member_status,
    membershipTypeDuration: entity.membership_type_duration,
    notes: entity.notes,
    registeredBy: entity.registered_by,
    registeredByUsername: entity.registered_by_username,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
    daysRemaining: entity.days_remaining,
    isExpiringSoon: entity.is_expiring_soon,
    statusColor: entity.status_color,
  }
}
