import type { Routes } from '@angular/router'

export const MEMBERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@features/members/pages/members-list/members-list').then((m) => m.MembersList),
  },
  {
    path: 'expiring-memberships',
    loadComponent: () =>
      import('@features/members/pages/inactive-members/inactive-members').then((m) => m.InactiveMembers),
  },
  {
    path: ':id',
    loadComponent: () => import('@features/members/pages/member-details/member-details').then((m) => m.MemberDetails),
  },
]
