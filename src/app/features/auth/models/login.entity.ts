export interface TokenEntity {
  access: string
  refresh: string
}

export interface UserInfoEntity {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
}
