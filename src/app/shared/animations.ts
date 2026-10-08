/**
 * ============================================================
 *  EVIELAND · Biblioteca de animaciones (@angular/animations)
 *  Filosofía: curvas de easing coherentes, duraciones cortas
 *  (180–420ms) y entradas siempre desde una dimensión espacial.
 *  Nada aparece de la nada: todo llega desde abajo, o se expande.
 * ============================================================
 */
import {
  animate,
  animateChild,
  group,
  query,
  state,
  style,
  transition,
  trigger,
  stagger,
  sequence,
} from '@angular/animations';

/** Curvas maestras — deben coincidir con los tokens CSS */
export const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const EASE_SPRING = 'cubic-bezier(0.34, 1.4, 0.5, 1)';
export const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';

/* ------------------------------------------------------------
 * 1. STAGGER · cuadrícula entrando en cascada
 *    Cada hijo sube 20px con un ligero escalado.
 *    Se dispara tanto al crear el contenedor (void => *)
 *    como cuando cambia la expresión del trigger (* => *).
 *    Uso: <div class="grid" [@staggerIn]="items().length">
 * ------------------------------------------------------------ */
const STAGGER_ENTER = [
  query(
    ':enter',
    [style({ opacity: 0, transform: 'translateY(20px) scale(0.94)' })],
    { optional: true }
  ),
  query(
    ':enter',
    [
      stagger(48, [
        animate(`520ms ${EASE_OUT}`, style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ],
    { optional: true }
  ),
];

export const staggerIn = trigger('staggerIn', [
  transition('void => *', STAGGER_ENTER),
  transition('* => *', STAGGER_ENTER),
]);

/* ------------------------------------------------------------
 * 2. FADE UP · entrada general de paneles, secciones, tablas
 * ------------------------------------------------------------ */
export const fadeUp = trigger('fadeUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(16px)' }),
    animate(`480ms ${EASE_OUT}`, style({ opacity: 1, transform: 'none' })),
  ]),
  transition(':leave', [
    animate(`180ms ease-in`, style({ opacity: 0, transform: 'translateY(-6px)' })),
  ]),
]);

/** fadeUp escalonado por índice: [@fadeUpStagger]="i" sobre cada fila */
export const fadeUpStagger = trigger('fadeUpStagger', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(14px)' }),
    animate('{{delay}}ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'none' })),
  ]),
  transition(':leave', [
    animate('160ms ease-in', style({ opacity: 0, transform: 'translateY(-6px)' })),
  ]),
]);

/* ------------------------------------------------------------
 * 3. PAGE TRANSITION · cambio de ruta con desplazamiento lateral
 *    Distingue dirección según la profundidad de la URL.
 * ------------------------------------------------------------ */
/** Profundidad de la ruta para decidir dirección de la transición */
const depth = (url: string) => url.split('/').filter(Boolean).length;

/** Los callbacks de `transition()` reciben el estado como string u objeto */
const stateName = (s: string | boolean | object | void): string =>
  typeof s === 'string'
    ? s
    : typeof s === 'object' && s && 'name' in s
      ? String((s as { name: unknown }).name)
      : '';

export const pageTransition = trigger('routeAnimations', [
  // Dashboard -> Sub-vista de colmena (avanzar: entra desde la derecha)
  transition(
    (fromState, toState) => depth(stateName(toState)) > depth(stateName(fromState)),
    [
      query(
        ':enter',
        [
          style({ opacity: 0, transform: 'translateX(46px) scale(0.985)' }),
          animate(
            `540ms ${EASE_OUT}`,
            style({ opacity: 1, transform: 'translateX(0) scale(1)' })
          ),
        ],
        { optional: true }
      ),
      query(
        ':leave',
        [
          animate(
            `280ms ${EASE_IN_OUT}`,
            style({ opacity: 0, transform: 'translateX(-32px) scale(0.99)' })
          ),
        ],
        { optional: true }
      ),
    ]
  ),
  // Sub-vista -> Dashboard (retroceder: reflejo)
  transition(
    (fromState, toState) => depth(stateName(toState)) < depth(stateName(fromState)),
    [
      query(
        ':enter',
        [
          style({ opacity: 0, transform: 'translateX(-46px) scale(0.985)' }),
          animate(`540ms ${EASE_OUT}`, style({ opacity: 1, transform: 'none' })),
        ],
        { optional: true }
      ),
      query(
        ':leave',
        [
          animate(
            `280ms ${EASE_IN_OUT}`,
            style({ opacity: 0, transform: 'translateX(32px)' })
          ),
        ],
        { optional: true }
      ),
    ]
  ),
  // Login <-> Registro y rutas hermanas: cross-fade + lift
  transition('* <=> *', [
    query(
      ':enter',
      [style({ opacity: 0, transform: 'translateY(24px)' })],
      { optional: true }
    ),
    group([
      query(
        ':leave',
        [animate(`260ms ${EASE_IN_OUT}`, style({ opacity: 0, transform: 'translateY(-18px)' }))],
        { optional: true }
      ),
      query(
        ':enter',
        [animate(`460ms 80ms ${EASE_OUT}`, style({ opacity: 1, transform: 'none' }))],
        { optional: true }
      ),
    ]),
  ]),
]);

/* ------------------------------------------------------------
 * 4. AUTH SWAP · login <-> registro dentro del mismo componente.
 *    Coreografía: el panel que sale sube y se desvanece;
 *    el que entra llega desde abajo con retardo de 90ms.
 * ------------------------------------------------------------ */
export const authSwap = trigger('authSwap', [
  transition('login => register', [
    query(
      ':enter, :leave',
      [style({ position: 'absolute', inset: 0, width: '100%' })],
      { optional: true }
    ),
    sequence([
      query(
        ':leave',
        [
          style({ opacity: 1 }),
          animate(`220ms ease-in`, style({ opacity: 0, transform: 'translateY(-14px)' })),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          animate(`400ms 60ms ${EASE_OUT}`, style({ opacity: 1, transform: 'none' })),
        ],
        { optional: true }
      ),
    ]),
  ]),
  transition('register => login', [
    query(
      ':enter, :leave',
      [style({ position: 'absolute', inset: 0, width: '100%' })],
      { optional: true }
    ),
    sequence([
      query(
        ':leave',
        [
          animate(`220ms ease-in`, style({ opacity: 0, transform: 'translateY(-14px)' })),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          animate(`400ms 60ms ${EASE_OUT}`, style({ opacity: 1, transform: 'none' })),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);

/* ------------------------------------------------------------
 * 5. MODAL · backdrop que se desvanece + panel que sube y
 *    escala desde 0.94 (spring muy leve en la salida).
 * ------------------------------------------------------------ */
export const modalAnimation = trigger('modal', [
  transition(':enter', [
    query(
      '.modal__backdrop',
      [style({ opacity: 0 }), animate('260ms ease', style({ opacity: 1 }))],
      { optional: true }
    ),
    query(
      '.modal__panel',
      [
        style({ opacity: 0, transform: 'translateY(26px) scale(0.94)' }),
        animate(`420ms ${EASE_SPRING}`, style({ opacity: 1, transform: 'none' })),
      ],
      { optional: true }
    ),
  ]),
  transition(':leave', [
    group([
      query('.modal__backdrop', [animate('200ms ease', style({ opacity: 0 }))], {
        optional: true,
      }),
      query(
        '.modal__panel',
        [
          animate(
            `200ms ${EASE_IN_OUT}`,
            style({ opacity: 0, transform: 'translateY(10px) scale(0.97)' })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);

/* ------------------------------------------------------------
 * 6. TOAST · entra deslizando desde abajo con rebote sutil,
 *    sale empujado hacia la derecha.
 * ------------------------------------------------------------ */
export const toastAnimation = trigger('toast', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(24px) scale(0.92)' }),
    animate(`420ms ${EASE_SPRING}`, style({ opacity: 1, transform: 'none' })),
  ]),
  transition(':leave', [
    animate(`220ms ${EASE_IN_OUT}`, style({ opacity: 0, transform: 'translateX(40px)' })),
  ]),
]);

/* ------------------------------------------------------------
 * 7. FORM STEP · expansión de layout al cambiar de pestaña:
 *    el contenido mide su altura y anima height de forma fluida.
 * ------------------------------------------------------------ */
export const expandHeight = trigger('expandHeight', [
  state('void', style({ height: 0, opacity: 0, overflow: 'hidden' })),
  state('*', style({ height: '*', opacity: 1, overflow: 'hidden' })),
  transition('* => *', [animate(`420ms ${EASE_OUT}`)]),
]);

/* ------------------------------------------------------------
 * 8. TAB CONTENT · cross-fade entre pestañas del menú de colmena
 * ------------------------------------------------------------ */
export const tabFade = trigger('tabFade', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(10px)' }),
    animate(`340ms ${EASE_OUT}`, style({ opacity: 1, transform: 'none' })),
  ]),
  transition(':leave', [
    animate(`160ms ease-in`, style({ opacity: 0, transform: 'translateY(-8px)' })),
  ]),
]);

/* ------------------------------------------------------------
 * 9. ACCORDION / EXPANSIÓN de detalles en la tabla de historial
 * ------------------------------------------------------------ */
export const reveal = trigger('reveal', [
  transition(':enter', [
    style({ opacity: 0, height: 0, overflow: 'hidden' }),
    animate(`320ms ${EASE_OUT}`, style({ opacity: 1, height: '*' })),
  ]),
  transition(':leave', [
    animate(`200ms ${EASE_IN_OUT}`, style({ opacity: 0, height: 0 })),
  ]),
]);

/* ------------------------------------------------------------
 * 10. PULSO · indicador de alerta sanitaria
 * ------------------------------------------------------------ */
export const pulse = trigger('pulse', [
  state('idle', style({ transform: 'scale(1)' })),
  state('beat', style({ transform: 'scale(1)' })),
  transition('idle => beat', [
    animate(`600ms ${EASE_OUT}`, style({ transform: 'scale(1.18)' })),
    animate(`400ms ${EASE_OUT}`, style({ transform: 'scale(1)' })),
  ]),
]);

/* ------------------------------------------------------------
 * 11. BOTÓN FAB · aparece girando ligeramente y creciendo
 * ------------------------------------------------------------ */
export const fabIn = trigger('fabIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.4) rotate(-24deg)' }),
    animate(`520ms 200ms ${EASE_SPRING}`, style({ opacity: 1, transform: 'none' })),
  ]),
  transition(':leave', [
    animate(`180ms ease-in`, style({ opacity: 0, transform: 'scale(0.4) rotate(24deg)' })),
  ]),
]);

/* ------------------------------------------------------------
 * 12. SUCCESS · check dibujado al guardar (stroke-dashoffset)
 * ------------------------------------------------------------ */
export const drawCheck = trigger('drawCheck', [
  transition(':enter', [
    style({ 'stroke-dasharray': 40, 'stroke-dashoffset': 40 }),
    animate(`420ms 120ms ${EASE_OUT}`, style({ 'stroke-dashoffset': 0 })),
  ]),
]);

export { animateChild, sequence };
