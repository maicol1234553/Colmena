import { Injectable, signal } from '@angular/core';
import { Component, inject } from '@angular/core';
import { toastAnimation } from './animations';

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly items = signal<Toast[]>([]);
  readonly pending = signal(false);
  private seq = 0;

  show(message: string, tone: Toast['tone'] = 'success', ms = 3200) {
    const id = ++this.seq;
    this.items.update((list) => [...list, { id, message, tone }]);
    setTimeout(() => this.dismiss(id), ms);
  }

  dismiss(id: number) {
    this.items.update((list) => list.filter((t) => t.id !== id));
  }
}

@Component({
  selector: 'evi-toasts',
  standalone: true,
  animations: [toastAnimation],
  template: `
    <div class="toasts" role="status" aria-live="polite">
      @for (t of toast.items(); track t.id) {
        <div class="toast toast--{{ t.tone }}" [@toast]>
          <span class="toast__dot"></span>
          {{ t.message }}
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toasts {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 60;
        pointer-events: none;
      }

      .toast {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px 20px 11px 16px;
        background: var(--ink);
        color: #fffdfa;
        border-radius: var(--r-full);
        font-size: 13.5px;
        font-weight: 500;
        box-shadow: var(--shadow-lg);
        white-space: nowrap;
      }

      .toast__dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--honey);
      }

      .toast--success .toast__dot {
        background: #8fd19a;
      }

      .toast--error .toast__dot {
        background: #f0937d;
      }
    `,
  ],
})
export class ToastsComponent {
  readonly toast = inject(ToastService);
}
