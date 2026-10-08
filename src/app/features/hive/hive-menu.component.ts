import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../shared/toast.service';
import { RippleDirective } from '../../shared/ripple.directive';
import { fadeUp, staggerIn } from '../../shared/animations';
import type { Hive } from '../../core/models';

type Action = 'check' | 'harvest' | 'history';

interface BigAction {
  key: Action;
  title: string;
  subtitle: string;
  icon: string;
}

@Component({
  selector: 'evi-hive-menu',
  standalone: true,
  imports: [RouterLink, RippleDirective],
  animations: [fadeUp, staggerIn],
  templateUrl: './hive-menu.component.html',
  styleUrl: './hive-menu.component.scss',
})
export class HiveMenuComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  readonly router = inject(Router);

  readonly hiveId = Number(this.route.snapshot.paramMap.get('id'));
  hive = signal<Hive | null>(null);
  active = signal<Action>('check');

  readonly actions: BigAction[] = [
    {
      key: 'check',
      title: 'Chequeo General',
      subtitle: 'Estado de la colmena, cuadro a cuadro',
      icon: 'M8 2v12M2 8h12M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6',
    },
    {
      key: 'harvest',
      title: 'Registro de Cosecha',
      subtitle: 'Alzas extraídas y método utilizado',
      icon: 'M4 6h8l2 4v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5l2-4Zm2-3h4',
    },
    {
      key: 'history',
      title: 'Ver Historial',
      subtitle: 'Todos los registros de esta colmena',
      icon: 'M3 3.5h10v9H3zM5.5 6.5h5M5.5 9h3',
    },
  ];

  ngOnInit() {
    this.api.listHives().subscribe({
      next: ({ hives }) => {
        const found = hives.find((h) => h.id === this.hiveId) ?? null;
        if (!found) this.toast.show('Colmena no encontrada', 'error');
        this.hive.set(found);
      },
      error: () => this.toast.show('No se pudo cargar la colmena', 'error'),
    });
  }

  select(action: BigAction) {
    this.active.set(action.key);
    // Pequeño retardo para que el thumb del segmented se anime
    setTimeout(() => this.router.navigate(['/hive', this.hiveId, action.key]), 190);
  }
}
