import { provideHttpClient, withInterceptors } from '@angular/common/http'
import {
  type ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { timeoutInterceptor } from '@core/interceptors/timeout.interceptor'
import { provideTaiga } from '@taiga-ui/core'
import { routes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([timeoutInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
    provideTaiga(),
  ],
}
