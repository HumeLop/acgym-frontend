import type { MemberStatus } from '@shared/models'

export interface Member {
  id: number
  name: string
  phone: string | null
  email: string | null
  status: MemberStatus
  notificationsEnabled: boolean
  createdAt: string
  updatedAt: string
  isActive: boolean
  activePaymentsCount: number
  daysUntilExpiration: number | null
  isExpiringSoon: boolean
}

export interface MemberStats {
  totalMembers: number
  activeMembers: number
  inactiveMembers: number
  expiringSoon: number
  withPhone: number
  withEmail: number
  notificationsEnabled: number
  totalRevenue: string
  averageSpentPerMember: string
}

export interface MemberDetail extends Member {
  dateOfBirth: string | null
  age: number
  emergencyContact: string | null
  emergencyPhone: string | null
  notes: string | null
  totalPaid: string | null
  lastPaymentDate: string | null
  paymentSummary: Record<string, unknown>
  fullPhoneNumber: string
}
