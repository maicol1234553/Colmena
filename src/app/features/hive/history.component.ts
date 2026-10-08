import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, downloadBlob } from '../../core/api.service';
import { ToastService } from '../../shared/toast.service';
import { RippleDirective } from '../../shared/ripple.directive';
import { fadeUp, staggerIn, reveal, tabFade } from '../../shared/animations';
import { HEALTH_TONE } from '../../core/models';
import type { HistoryRecord } from '../../core/models';

@Component({
  selector: 'evi-history',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, RippleDirective],
  animations: [fadeUp, staggerIn, reveal, tabFade],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly hiveId = Number(this.route.snapshot.paramMap.get('id'));
  readonly tone = HEALTH_TONE;

  records = signal<HistoryRecord[]>([]);
  loading = signal(true);
  exporting = signal(false);
  expanded = signal<number | null>(null);

  from = '';
  to = '';

  get count() {
    return this.records().length;
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.history(this.hiveId, this.from || undefined, this.to || undefined).subscribe({
      next: ({ records }) => {
        this.records.set(records);
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('No se pudo cargar el historial', 'error');
        this.loading.set(false);
      },
    });
  }

  clearFilters() {
    this.from = '';
    this.to = '';
    this.load();
  }

  toggle(id: number) {
    this.expanded.update((cur) => (cur === id ? null : id));
  }

  presenceOf(r: HistoryRecord): string {
    const parts: string[] = [];
    if (r.has_honey) parts.push('Miel');
    if (r.has_bee_bread) parts.push('Pan de abeja');
    if (r.has_sealed_brood) parts.push('Cría operculada');
    if (r.has_open_brood) parts.push('Cría abierta');
    return parts.length ? parts.join(' · ') : '—';
  }

  exportThis() {
    if (this.exporting()) return;
    this.exporting.set(true);
    this.api.exportExcel(this.hiveId, this.from || undefined, this.to || undefined).subscribe({
      next: (blob) => {
        downloadBlob(blob, `colmena-${this.hiveId}-historial.xlsx`);
        this.toast.show('Excel generado');
        this.exporting.set(false);
      },
      error: () => {
        this.toast.show('Error al exportar', 'error');
        this.exporting.set(false);
      },
    });
  }
}
