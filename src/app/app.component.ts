import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { ToastService, ToastsComponent } from './shared/toast.service';
import { pageTransition } from './shared/animations';

@Component({
  selector: 'evi-root',
  standalone: true,
  imports: [RouterOutlet, ToastsComponent],
  animations: [pageTransition],
  template: `
    <!-- Barra de progreso global mientras hay peticiones activas -->
    @if (loading()) {
      <div class="progress" aria-hidden="true"></div>
    }

    <main class="shell" [@routeAnimations]="prepRoute(outlet)">
      <router-outlet #outlet="outlet" />
    </main>

    <evi-toasts />
  `,
  styles: [
    `
      .shell {
        min-height: 100vh;
        position: relative;
      }
    `,
  ],
})
export class AppComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  /** True mientras el router está resolviendo (usado por @routeAnimations) */
  loading = this.toast.pending;

  prepRoute(outlet: RouterOutlet) {
    return outlet.isActivated ? outlet.activatedRouteData['animation'] : null;
  }
}
