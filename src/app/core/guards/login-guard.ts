import { inject } from '@angular/core'
import type { CanMatchFn } from '@angular/router'
import { Router } from '@angular/router'
import { AuthService } from '@features/auth/services/auth-service'

export const loginGuard: CanMatchFn = () => {
  const authService = inject(AuthService)
  const router = inject(Router)

  if (authService.isAuthenticated()) {
    return router.parseUrl('/dashboard')
  }

  return true
}
