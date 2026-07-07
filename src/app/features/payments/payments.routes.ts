import type { Routes } from '@angular/router'

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/payments/pages/payment-dashboard/payment-dashboard').then((m) => m.PaymentDashboard),
  },
  {
    path: 'payments-list',
    loadComponent: () => import('@features/payments/pages/payments-list/payments-list').then((m) => m.PaymentsList),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@features/payments/pages/payment-details/payment-details').then((m) => m.PaymentDetails),
  },
]
