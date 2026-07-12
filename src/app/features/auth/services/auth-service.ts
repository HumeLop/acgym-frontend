import { HttpClient, httpResource } from '@angular/common/http'
import { computed, effect, inject, Service, signal } from '@angular/core'
import { Router } from '@angular/router'
import { environment } from '@environments/environment'
import { toUserInfo } from '@features/auth/adapters/login.adapter'
import type { LoginRequestDto, TokenEntity, TokenRefreshRequestDto } from '@features/auth/models'
import type { UserInfoEntity } from '@features/auth/models/login.entity'
import type { UserInfo } from '@features/auth/models/login.model'
import { TuiNotificationService } from '@taiga-ui/core'
import { catchError, finalize, type Observable, tap, throwError } from 'rxjs'

const STORAGE_KEY_ACCESS = 'acgym_access_token'
const STORAGE_KEY_REFRESH = 'acgym_refresh_token'

@Service()
export class AuthService {
  private http = inject(HttpClient)
  private alerts = inject(TuiNotificationService)
  private router = inject(Router)
  private apiURL = `${environment.apiURL}/token`

  private _accessToken = signal<string | null>(null)
  private _refreshToken = signal<string | null>(null)
  private _user = signal<UserInfo | null>(null)
  private _isLoading = signal(false)
  private _authInitialized = signal(false)

  readonly accessToken = this._accessToken.asReadonly()
  readonly refreshToken = this._refreshToken.asReadonly()
  readonly user = this._user.asReadonly()
  readonly isLoading = this._isLoading.asReadonly()
  readonly authInitialized = this._authInitialized.asReadonly()
  readonly isAuthenticated = computed(() => this._accessToken() !== null)
  readonly isAdmin = computed(() => this._user()?.role === 'admin')
  readonly isReceptionist = computed(() => this._user()?.role === 'receptionist')
  readonly userRole = computed(() => this._user()?.role ?? null)

  private readonly userResource = httpResource<UserInfoEntity>(() => {
    const token = this._accessToken()
    return token ? { url: `${environment.apiURL}/users/me/` } : undefined
  })

  constructor() {
    this.restoreSession()
    this._authInitialized.set(true)

    effect(() => {
      const token = this._accessToken()
      if (token) {
        localStorage.setItem(STORAGE_KEY_ACCESS, token)
      } else {
        localStorage.removeItem(STORAGE_KEY_ACCESS)
      }
    })

    effect(() => {
      const token = this._refreshToken()
      if (token) {
        localStorage.setItem(STORAGE_KEY_REFRESH, token)
      } else {
        localStorage.removeItem(STORAGE_KEY_REFRESH)
      }
    })

    effect(() => {
      const entity = this.userResource.value()
      if (entity) {
        this._user.set(toUserInfo(entity))
      }
    })
  }

  login(credentials: LoginRequestDto): Observable<TokenEntity> {
    this._isLoading.set(true)
    return this.http.post<TokenEntity>(`${this.apiURL}/`, credentials).pipe(
      tap((tokens) => {
        this._accessToken.set(tokens.access)
        this._refreshToken.set(tokens.refresh)
      }),
      catchError((err) => {
        this.alerts.open('Error al iniciar sesión', { appearance: 'error', label: 'Error' }).subscribe()
        return throwError(() => err)
      }),
      finalize(() => this._isLoading.set(false))
    )
  }

  refreshAccessToken(): Observable<TokenEntity> {
    const refresh = this._refreshToken()
    if (!refresh) {
      return throwError(() => new Error('No hay token de actualización'))
    }
    const body: TokenRefreshRequestDto = { refresh }
    return this.http.post<TokenEntity>(`${this.apiURL}/refresh/`, body).pipe(
      tap((tokens) => {
        this._accessToken.set(tokens.access)
      }),
      catchError((err) => {
        this.logout()
        return throwError(() => err)
      })
    )
  }

  logout() {
    this._accessToken.set(null)
    this._refreshToken.set(null)
    this._user.set(null)
    location.replace('/login')
  }

  private restoreSession() {
    const access = localStorage.getItem(STORAGE_KEY_ACCESS)
    const refresh = localStorage.getItem(STORAGE_KEY_REFRESH)
    if (access) {
      this._accessToken.set(access)
    }
    if (refresh) {
      this._refreshToken.set(refresh)
    }
  }
}
