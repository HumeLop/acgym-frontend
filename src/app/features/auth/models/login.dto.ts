export interface LoginRequestDto {
  username: string
  password: string
}

export interface TokenRefreshRequestDto {
  refresh: string
}
