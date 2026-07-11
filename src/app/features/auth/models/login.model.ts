export interface UserInfo {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export interface AuthState {
  accessToken: string
  refreshToken: string
  user: UserInfo | null
}
