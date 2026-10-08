import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../shared/toast.service';
import { RippleDirective } from '../../shared/ripple.directive';
import { fadeUp, drawCheck } from '../../shared/animations';
import { OPTIONS } from '../../core/models';
import type { Method, WaxOption } from '../../core/models';

@Component({
  selector: 'evi-harvest-form',
  standalone: true,
  imports: [FormsModule, RouterLink, RippleDirective],
  animations: [fadeUp, drawCheck],
  templateUrl: './harvest-form.component.html',
  styleUrl: './harvest-form.component.scss',
})
export class HarvestFormComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly hiveId = Number(this.route.snapshot.paramMap.get('id'));
  readonly OPT = OPTIONS;

  date = new Date().toISOString().slice(0, 10);
  superModel = 1;
  frame = 3;
  method: Method = 'Centrífuga';
  replacementFrame: WaxOption = 'Con cera';
  missingFrames: WaxOption = 'Con cera';

  saving = signal(false);
  saved = signal(false);

  save() {
    if (this.saving()) return;
    this.saving.set(true);

    this.api
      .saveHarvest({
        hiveId: this.hiveId,
        date: this.date,
        super: this.superModel,
        frame: this.frame,
        method: this.method,
        replacementFrame: this.replacementFrame,
        missingFrames: this.missingFrames,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.saved.set(true);
          this.toast.show('Cosecha registrada');
          setTimeout(() => this.router.navigate(['/hive', this.hiveId]), 1100);
        },
        error: (e) => {
          this.saving.set(false);
          this.toast.show(e?.error?.error ?? 'No se pudo guardar', 'error');
        },
      });
  }
}
