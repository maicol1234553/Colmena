import { Component, EventEmitter, Input, Output } from '@angular/core';
import { modalAnimation } from '../shared/animations';
import { RippleDirective } from '../shared/ripple.directive';

/**
 * Diálogo de confirmación coreografiado.
 * Uso:
 *   @if (open) {
 *     <evi-confirm
 *       title="¿Eliminar colmena?"
 *       message="Esta acción archivará la colmena y su historial."
 *       (confirm)="onDelete()" (close)="open = false" />
 *   }
 */
@Component({
  selector: 'evi-confirm',
  standalone: true,
  imports: [RippleDirective],
  animations: [modalAnimation],
  template: `
    <div class="modal" role="dialog" aria-modal="true" (click)="close.emit()" [@modal]>
      <div class="modal__backdrop"></div>

      <div class="modal__panel" (click)="$event.stopPropagation()">
        <p class="eyebrow">{{ eyebrow }}</p>
        <h3 class="modal__title">{{ title }}</h3>
        <p class="modal__text">{{ message }}</p>

        <div class="modal__actions">
          <button class="btn btn--ghost" eviRipple (click)="close.emit()">Cancelar</button>
          <button
            class="btn"
            [class.btn--primary]="danger"
            [class.btn--honey]="!danger"
            eviRipple
            (click)="confirm.emit()"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: grid;
        place-items: center;
        padding: 24px;
      }

      .modal__backdrop {
        position: absolute;
        inset: 0;
        background: rgba(28, 26, 23, 0.34);
        backdrop-filter: blur(6px);
      }

      .modal__panel {
        position: relative;
        width: min(430px, 100%);
        padding: 30px;
        background: var(--paper-raised);
        border-radius: var(--r-lg);
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--line);
      }

      .modal__title {
        font-size: 25px;
        margin: 10px 0 8px;
      }

      .modal__text {
        margin: 0;
        color: var(--ink-2);
        font-size: 14.5px;
      }

      .modal__actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 26px;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) message = '';
  @Input() eyebrow = 'Confirmar';
  @Input() confirmLabel = 'Confirmar';
  @Input() danger = true;

  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
