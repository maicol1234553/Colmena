import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../shared/toast.service';
import { RippleDirective } from '../../shared/ripple.directive';
import { fadeUp, drawCheck, tabFade } from '../../shared/animations';
import { OPTIONS } from '../../core/models';
import type {
  FoodReserve,
  HealthStatus,
  Hygiene,
  Population,
  Presence,
  QueenStatus,
  Temperament,
} from '../../core/models';

@Component({
  selector: 'evi-check-form',
  standalone: true,
  imports: [FormsModule, RouterLink, RippleDirective],
  animations: [fadeUp, drawCheck, tabFade],
  templateUrl: './check-form.component.html',
  styleUrl: './check-form.component.scss',
})
export class CheckFormComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly hiveId = Number(this.route.snapshot.paramMap.get('id'));

  // Referencias para el template
  readonly OPT = OPTIONS;

  // Estado del formulario
  date = new Date().toISOString().slice(0, 10);
  superModel = 1;
  frame = 5;
  temperament: Temperament = 'Manso';
  population: Population = 'Media';

  presence: Presence = { honey: true, beeBread: false, sealedBrood: true, openBrood: false };
  pct = 50;

  queenStatus: QueenStatus = 'Vista';
  foodReserve: FoodReserve = 'Buena';
  artificialFeed = false;
  hygiene: Hygiene = 'Bueno';
  health: HealthStatus = 'Sano';
  notes = '';

  saving = signal(false);
  saved = signal(false);

  get presenceSummary(): string {
    const labels: [keyof Presence, string][] = [
      ['honey', 'Miel'],
      ['beeBread', 'Pan de abeja'],
      ['sealedBrood', 'Cría operculada'],
      ['openBrood', 'Cría abierta'],
    ];
    const on = labels.filter(([k]) => this.presence[k]).map(([, l]) => l);
    return on.length ? on.join(' · ') : 'Ninguno';
  }

  save() {
    if (this.saving()) return;
    this.saving.set(true);

    this.api
      .saveCheckup({
        hiveId: this.hiveId,
        date: this.date,
        super: this.superModel,
        frame: this.frame,
        temperament: this.temperament,
        population: this.population,
        presence: { ...this.presence },
        framePercentage: this.pct,
        queenStatus: this.queenStatus,
        foodReserve: this.foodReserve,
        artificialFeed: this.artificialFeed,
        hygiene: this.hygiene,
        health: this.health,
        notes: this.notes.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.saved.set(true);
          this.toast.show('Chequeo guardado');
          setTimeout(() => this.router.navigate(['/hive', this.hiveId]), 1100);
        },
        error: (e) => {
          this.saving.set(false);
          this.toast.show(e?.error?.error ?? 'No se pudo guardar', 'error');
        },
      });
  }
}
