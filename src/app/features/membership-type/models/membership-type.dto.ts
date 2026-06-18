export interface MembershipTypeRequestDto {
  name: string
  amount: string
  description?: string
  duration_days: number
  is_active?: boolean
}
