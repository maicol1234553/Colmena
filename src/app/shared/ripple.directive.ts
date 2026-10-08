import { Directive, ElementRef, HostListener } from '@angular/core';

/**
 * Agrega un ripple bajo el cursor al hacer clic.
 * Uso: <button eviRipple>…</button>  (requiere position: relative en el CSS)
 */
@Directive({ selector: '[eviRipple]', standalone: true })
export class RippleDirective {
  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    const host = this.el.nativeElement;
    const rect = host.getBoundingClientRect();

    const dot = document.createElement('span');
    dot.className = 'ripple__dot';
    dot.style.left = `${event.clientX - rect.left}px`;
    dot.style.top = `${event.clientY - rect.top}px`;

    const layer = document.createElement('span');
    layer.className = 'ripple';
    layer.appendChild(dot);
    host.appendChild(layer);

    dot.addEventListener('animationend', () => layer.remove(), { once: true });
  }
}
