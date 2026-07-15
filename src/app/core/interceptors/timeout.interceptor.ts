import type { HttpInterceptorFn } from '@angular/common/http'
import { catchError, throwError, timeout } from 'rxjs'

export const timeoutInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    timeout(30000),
    catchError((err) => {
      if (err.name === 'TimeoutError') {
        return throwError(() => new Error('La API no respondió a tiempo'))
      }
      return throwError(() => err)
    })
  )
}
