import { provideHttpClient, withInterceptors } from '@angular/common/http'
import {
  type ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core'
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router'
import { provideServiceWorker } from '@angular/service-worker'
import { timeoutInterceptor } from '@core/interceptors/timeout.interceptor'
import { provideTaiga } from '@taiga-ui/core'
import { routes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([timeoutInterceptor])),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideTaiga(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
}
