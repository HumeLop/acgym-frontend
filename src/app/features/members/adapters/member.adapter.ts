import type { MemberDetailEntity, MemberEntity, MemberStatsEntity } from '../models/member.entity'
import type { Member, MemberDetail, MemberStats } from '../models/member.model'

export function toMember(entity: MemberEntity): Member {
  return {
    id: entity.id,
    name: entity.name,
    phone: entity.phone,
    email: entity.email,
    status: entity.status,
    notificationsEnabled: entity.notifications_enabled,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
    isActive: entity.is_active,
    activePaymentsCount: entity.active_payments_count,
    daysUntilExpiration: entity.days_until_expiration,
    isExpiringSoon: entity.is_expiring_soon,
  }
}

export function toMemberStats(entity: MemberStatsEntity): MemberStats {
  return {
    totalMembers: entity.total_members,
    activeMembers: entity.active_members,
    inactiveMembers: entity.inactive_members,
    expiringSoon: entity.expiring_soon,
    withPhone: entity.with_phone,
    withEmail: entity.with_email,
    notificationsEnabled: entity.notifications_enabled,
    totalRevenue: entity.total_revenue,
    averageSpentPerMember: entity.average_spent_per_member,
  }
}

export function toMemberDetail(entity: MemberDetailEntity): MemberDetail {
  return {
    ...toMember(entity),
    dateOfBirth: entity.date_of_birth,
    age: entity.age,
    emergencyContact: entity.emergency_contact,
    emergencyPhone: entity.emergency_phone,
    notes: entity.notes,
    totalPaid: entity.total_paid,
    lastPaymentDate: entity.last_payment_date,
    paymentSummary: entity.payment_summary,
    fullPhoneNumber: entity.full_phone_number,
  }
}
