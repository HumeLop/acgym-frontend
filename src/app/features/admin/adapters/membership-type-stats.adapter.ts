import type { MembershipTypeStats } from '@features/admin/models/membership-type-stats.model'
import type { MembershipTypeStatsEntity } from '@features/admin/models/membership-type-stats.entity'

export function adaptMembershipTypeStats(entity: MembershipTypeStatsEntity): MembershipTypeStats {
  return {
    totalPayments: entity.total_payments,
    activePayments: entity.active_payments,
    totalRevenue: entity.total_revenue,
    averagePayment: entity.average_payment,
  }
}
