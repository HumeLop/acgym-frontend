import type { Routes } from '@angular/router'

export const MEMBERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/members/pages/member-dashboard/member-dashboard').then((m) => m.MemberDashboard),
  },
  {
    path: 'members-list',
    loadComponent: () => import('@features/members/pages/members-list/members-list').then((m) => m.MembersList),
  },
  {
    path: 'inactive-members-list',
    loadComponent: () =>
      import('@features/members/pages/inactive-members-list/inactive-members-list').then(
        (iml) => iml.InactiveMembersList
      ),
  },
  {
    path: 'expiring-memberships',
    loadComponent: () =>
      import('@features/members/pages/expiring-members/expiring-members').then((m) => m.ExpiringMembers),
  },
  {
    path: ':id',
    loadComponent: () => import('@features/members/pages/member-details/member-details').then((m) => m.MemberDetails),
  },
]
