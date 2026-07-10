import type { MembershipTypeEntity } from '../../admin/models/membership-type.entity'
import type { MembershipType } from '../../admin/models/membership-type.model'

export function toMembershipType(entity: MembershipTypeEntity): MembershipType {
  return {
    id: entity.id,
    name: entity.name,
    amount: entity.amount,
    description: entity.description,
    durationDays: entity.duration_days,
    isActive: entity.is_active,
    paymentsCount: entity.payments_count,
    totalRevenue: entity.total_revenue,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  }
}
