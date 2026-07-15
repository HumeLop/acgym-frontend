import { isPlatformBrowser } from '@angular/common'
import type { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { inject, PLATFORM_ID } from '@angular/core'
import { AuthService } from '@features/auth/services/auth-service'
import { catchError, switchMap, throwError } from 'rxjs'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const platformId = inject(PLATFORM_ID)

  if (!isPlatformBrowser(platformId)) {
    return next(req)
  }

  const skipAuth = req.url.includes('/api/token/')

  let authReq = req
  if (!skipAuth) {
    const token = authService.accessToken()
    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    }
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !skipAuth) {
        return authService.refreshAccessToken().pipe(
          switchMap(() => {
            const newToken = authService.accessToken()
            const newRequest = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            })
            return next(newRequest)
          }),
          catchError(() => {
            authService.logout()
            return throwError(() => error)
          })
        )
      }
      return throwError(() => error)
    })
  )
}
