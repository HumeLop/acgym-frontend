import type { Routes } from '@angular/router'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@core/layout/shell/shell').then((m) => m.Shell),
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
        loadChildren: () => import('@features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
    ],
  },
]
