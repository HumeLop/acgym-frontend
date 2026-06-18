import type { Routes } from '@angular/router'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@core/layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('@features/dashboard/pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
    ],
  },
]
