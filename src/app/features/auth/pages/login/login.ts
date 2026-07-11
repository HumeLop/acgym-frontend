import { Component, inject, linkedSignal, signal } from '@angular/core'
import { FormField, form, required, submit } from '@angular/forms/signals'
import { Router } from '@angular/router'
import { TuiAutoFocus } from '@taiga-ui/cdk'
import { TuiRipple } from '@taiga-ui/addon-mobile'
import { ThemeService } from '@core/services/theme-service'
import type { LoginRequestDto } from '@features/auth/models'
import { AuthService } from '@features/auth/services/auth-service'
import { TuiButton, TuiIcon, TuiNotification } from '@taiga-ui/core'
import { TuiButtonLoading } from '@taiga-ui/kit'

@Component({
  selector: 'app-login',
  imports: [FormField, TuiAutoFocus, TuiButton, TuiButtonLoading, TuiIcon, TuiNotification, TuiRipple],
  templateUrl: './login.html',
})
export class Login {
  private authService = inject(AuthService)
  private themeSvc = inject(ThemeService)
  private router = inject(Router)

  protected readonly isDark = this.themeSvc.isDark
  protected readonly isLoading = this.authService.isLoading
  protected errorMessage = signal<string | null>(null)
  protected showPassword = signal(false)

  private formData = linkedSignal(() => ({ username: '', password: '' }))

  protected loginForm = form(this.formData, (path) => {
    required(path.username, { message: 'El usuario es obligatorio' })
    required(path.password, { message: 'La contraseña es obligatoria' })
  })

  protected toggleTheme() {
    this.themeSvc.nextMode()
  }

  protected togglePasswordVisibility() {
    this.showPassword.update((v) => !v)
  }

  protected onSubmit() {
    submit(this.loginForm, async () => {
      this.errorMessage.set(null)

      const data = this.formData()
      const credentials: LoginRequestDto = {
        username: data.username,
        password: data.password,
      }

      try {
        await new Promise<void>((resolve, reject) => {
          this.authService.login(credentials).subscribe({
            next: () => {
              this.router.navigate(['/dashboard'])
              resolve()
            },
            error: (err) => {
              reject(err)
            },
          })
        })
      } catch {
        this.errorMessage.set('Usuario o contraseña incorrectos')
      }
    })
  }
}
