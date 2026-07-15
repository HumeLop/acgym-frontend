import type { Routes } from '@angular/router'
import { adminGuard } from '@core/guards/admin-guard'
import { authGuard } from '@core/guards/auth-guard'

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () => import('@core/layout/shell/shell').then((m) => m.Shell),
    canMatch: [authGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('@features/dashboard/pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'members',
        loadChildren: () => import('@features/members/members.routes').then((m) => m.MEMBERS_ROUTES),
      },
      {
        path: 'payments',
        loadChildren: () => import('@features/payments/payments.routes').then((m) => m.PAYMENTS_ROUTES),
      },
      {
        path: 'admin',
        canMatch: [adminGuard],
        loadChildren: () => import('@features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '/login' },
]
