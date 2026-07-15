export interface MemberWriteDto {
  name: string
  phone?: string | null
  email?: string | null
  date_of_birth?: string | null
  emergency_contact?: string | null
  emergency_phone?: string | null
  notes?: string | null
  notifications_enabled?: boolean
}

export interface MemberWriteResponseDto {
  id: number
  name: string
  phone: string | null
  email: string | null
  date_of_birth: string | null
  emergency_contact: string | null
  emergency_phone: string | null
  notes: string | null
  notifications_enabled: boolean
}
