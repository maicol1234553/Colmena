import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../shared/toast.service';
import { RippleDirective } from '../../shared/ripple.directive';
import { authSwap, fadeUp } from '../../shared/animations';

type Mode = 'login' | 'register';

@Component({
  selector: 'evi-auth',
  standalone: true,
  imports: [FormsModule, RippleDirective],
  animations: [authSwap, fadeUp],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  mode = signal<Mode>('login');
  loading = signal(false);
  error = signal<string | null>(null);

  email = '';
  password = '';
  displayName = '';

  constructor(private auth: AuthService, private router: Router, private toast: ToastService) {}

  /** Transición coreografiada entre vistas sin recargar nada */
  swap(mode: Mode) {
    if (this.mode() === mode) return;
    this.error.set(null);
    this.mode.set(mode);
  }

  submit() {
    if (this.loading()) return;
    this.error.set(null);
    this.loading.set(true);

    const req =
      this.mode() === 'login'
        ? this.auth.login(this.email, this.password)
        : this.auth.register(this.email, this.password, this.displayName);

    req.subscribe({
      next: () => {
        this.toast.show(
          this.mode() === 'login' ? 'Bienvenido de vuelta' : 'Cuenta creada · 15 colmenas listas'
        );
        this.router.navigate(['/dashboard']);
      },
      error: (e) => {
        this.error.set(e?.error?.error ?? 'No se pudo continuar');
        this.loading.set(false);
      },
    });
  }
}
