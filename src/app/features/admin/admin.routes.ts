import type { Routes } from '@angular/router'
import { AdminShell } from '@features/admin/pages/shell/shell'

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShell,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('@app/features/admin/pages/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'users',
        loadComponent: () => import('@features/admin/pages/users/users-list/users-list').then((m) => m.AdminUsersList),
      },
      {
        path: 'users/:id',
        loadComponent: () =>
          import('@features/admin/pages/users/user-detail/user-detail').then((m) => m.AdminUserDetail),
      },
      {
        path: 'membership-types',
        loadComponent: () =>
          import('@features/admin/pages/membership-type/membership-types-list/membership-types-list').then(
            (m) => m.AdminMembershipTypesList
          ),
      },
      {
        path: 'membership-types/:id',
        loadComponent: () =>
          import('@features/admin/pages/membership-type/membership-type-detail/membership-type-detail').then(
            (m) => m.AdminMembershipTypeDetail
          ),
      },
    ],
  },
]
