import type { PaymentMethod, PaymentStatus } from '@shared/models'

export interface Payment {
  id: number
  member: number
  memberName: string
  membershipType: number
  membershipTypeName: string
  amount: string
  paymentDate: string
  paymentMethod: PaymentMethod
  startDate: string | null
  endDate: string | null
  isActive: boolean
}

export interface PaymentStats {
  totalPayments: number
  totalAmount: string
  activePayments: number
  expiredPayments: number
  expiringSoon: number
  byMethod: Record<string, number>
  amountByMethod: Record<string, string>
  averagePayment: string
}

export interface PaymentDetail extends Payment {
  memberEmail: string
  memberPhone: string
  memberStatus: string
  membershipTypeDuration: number
  notes: string
  registeredBy: number | null
  registeredByUsername: string | null
  createdAt: string
  updatedAt: string
  daysRemaining: number
  isExpiringSoon: boolean
  statusColor: string
}
