import type { Routes } from '@angular/router'
import { loginGuard } from '@core/guards/login-guard'

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    canMatch: [loginGuard],
    loadComponent: () => import('@features/auth/pages/login/login').then((m) => m.Login),
  },
]
