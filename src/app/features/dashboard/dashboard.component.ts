import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, downloadBlob } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../shared/toast.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { RippleDirective } from '../../shared/ripple.directive';
import {
  staggerIn,
  fadeUp,
  modalAnimation,
  fabIn,
  pulse,
} from '../../shared/animations';
import type { Hive, Kpis } from '../../core/models';

const HIVE_PALETTE = [
  '#E0A33A', '#D08F3C', '#BE8348', '#A98A5E', '#97895F',
  '#7F8B5C', '#5F8A5F', '#C98B5B', '#B97E1F', '#8C857C',
];

@Component({
  selector: 'evi-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, ConfirmDialogComponent, RippleDirective],
  animations: [staggerIn, fadeUp, modalAnimation, fabIn, pulse],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  hives = signal<Hive[]>([]);
  kpis = signal<Kpis | null>(null);
  loading = signal(true);
  exporting = signal(false);

  // Modal de alta
  modalOpen = signal(false);
  newName = '';
  newColor = HIVE_PALETTE[0];
  palette = HIVE_PALETTE;

  // Modal de confirmación
  confirmOpen = signal(false);
  target: Hive | null = null;

  /** Número de la colmena a partir de su nombre ("Colmena 12" -> "12") */
  hiveNumber(name: string): string {
    const n = name.match(/\d+/);
    return n ? n[0] : '·';
  }

  get userName() {
    return this.auth.user()?.displayName || this.auth.user()?.email || 'Apicultor';
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.listHives().subscribe({
      next: ({ hives, kpis }) => {
        this.hives.set(hives);
        this.kpis.set(kpis);
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('No se pudieron cargar las colmenas', 'error');
        this.loading.set(false);
      },
    });
  }

  openModal() {
    this.newName = this.suggestName();
    this.newColor = this.palette[this.hives().length % this.palette.length];
    this.modalOpen.set(true);
  }

  suggestName(): string {
    const nums = this.hives().map((h) => Number(h.name.replace(/\D/g, '')) || 0);
    return `Colmena ${(nums.length ? Math.max(...nums) : 0) + 1}`;
  }

  createHive() {
    const name = this.newName.trim();
    if (!name) return;
    this.api.createHive(name, this.newColor).subscribe({
      next: () => {
        this.modalOpen.set(false);
        this.toast.show(`${name} creada`);
        this.load();
      },
      error: (e) => this.toast.show(e?.error?.error ?? 'No se pudo crear', 'error'),
    });
  }

  askDelete(hive: Hive) {
    this.target = hive;
    this.confirmOpen.set(true);
  }

  deleteHive() {
    if (!this.target) return;
    const name = this.target.name;
    this.api.deleteHive(this.target.id).subscribe({
      next: () => {
        this.confirmOpen.set(false);
        this.toast.show(`${name} archivada`, 'info');
        this.load();
      },
      error: () => this.toast.show('No se pudo archivar', 'error'),
    });
  }

  exportAll() {
    if (this.exporting()) return;
    this.exporting.set(true);
    this.api.exportExcel().subscribe({
      next: (blob) => {
        downloadBlob(blob, `evieland-historial-${new Date().toISOString().slice(0, 10)}.xlsx`);
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
