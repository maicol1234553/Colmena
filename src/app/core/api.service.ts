import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
  CheckupPayload,
  HarvestPayload,
  Hive,
  HistoryRecord,
  Kpis,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  /* ---------- Colmenas ---------- */
  listHives(): Observable<{ hives: Hive[]; kpis: Kpis }> {
    return this.http.get<{ hives: Hive[]; kpis: Kpis }>('/api/hives');
  }

  createHive(name: string, color: string) {
    return this.http.post<{ id: number }>('/api/hives', { name, color });
  }

  deleteHive(id: number) {
    return this.http.delete<{ ok: boolean }>(`/api/hives/${id}`);
  }

  /* ---------- Registros ---------- */
  saveCheckup(payload: CheckupPayload) {
    return this.http.post<{ id: number }>('/api/records/checkup', payload);
  }

  saveHarvest(payload: HarvestPayload) {
    return this.http.post<{ id: number }>('/api/records/harvest', payload);
  }

  history(hiveId: number, from?: string, to?: string): Observable<{ records: HistoryRecord[] }> {
    let params = new HttpParams().set('hiveId', hiveId);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<{ records: HistoryRecord[] }>('/api/records/history', { params });
  }

  /* ---------- Exportación ---------- */
  exportExcel(hiveId?: number, from?: string, to?: string): Observable<Blob> {
    let params = new HttpParams();
    if (hiveId) params = params.set('hiveId', hiveId);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get('/api/records/export', { params, responseType: 'blob' });
  }
}

/** Descarga un Blob como archivo (sin abrir otra pestaña). */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
