export type Temperament = 'Manso' | 'Defensivo' | 'Agresivo';
export type Population = 'Alta' | 'Media' | 'Baja';
export type QueenStatus = 'Vista' | 'No vista' | 'Celdas reales';
export type FoodReserve = 'Excelente' | 'Buena' | 'Escasa' | 'Nula';
export type Hygiene = 'Bueno' | 'Regular' | 'Malo';
export type HealthStatus = 'Sano' | 'Varroa' | 'Loque' | 'Otro';
export type Method = 'Presión' | 'Centrífuga';
export type WaxOption = 'Con cera' | 'Sin cera';

export interface User {
  id: number;
  email: string;
  displayName?: string | null;
}

export interface Hive {
  id: number;
  name: string;
  color: string;
  status: 'active' | 'inactive' | 'lost';
  total_checkups: number;
  total_harvests: number;
  last_activity?: string | null;
  last_health?: HealthStatus | null;
}

export interface Kpis {
  activeHives: number;
  totalCheckups: number;
  totalHarvests: number;
  alerts: number;
}

export interface Presence {
  honey: boolean;
  beeBread: boolean;
  sealedBrood: boolean;
  openBrood: boolean;
}

export interface CheckupPayload {
  hiveId: number;
  date: string;
  super: number;
  frame: number;
  temperament: Temperament;
  population: Population;
  presence: Presence;
  framePercentage: number;
  queenStatus: QueenStatus;
  foodReserve: FoodReserve;
  artificialFeed: boolean;
  hygiene: Hygiene;
  health: HealthStatus;
  notes?: string;
}

export interface HarvestPayload {
  hiveId: number;
  date: string;
  super: number;
  frame: number;
  method: Method;
  replacementFrame: WaxOption;
  missingFrames: WaxOption;
}

export interface HistoryRecord {
  kind: 'checkup' | 'harvest';
  id: number;
  date: string;
  super_: number;
  frame: number;
  temperament?: Temperament | null;
  population?: Population | null;
  has_honey?: number;
  has_bee_bread?: number;
  has_sealed_brood?: number;
  has_open_brood?: number;
  frame_percentage?: number;
  queen_status?: QueenStatus | null;
  food_reserve?: FoodReserve | null;
  artificial_feed?: number;
  hygiene_behavior?: Hygiene | null;
  health_status?: HealthStatus | null;
  notes?: string | null;
  method?: Method | null;
  replacement_frame?: WaxOption | null;
  missing_frames?: WaxOption | null;
}

/** Constantes para poblar los formularios sin texto libre */
export const OPTIONS = {
  frames: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  supers: [1, 2, 3, 4],
  temperament: ['Manso', 'Defensivo', 'Agresivo'] as Temperament[],
  population: ['Alta', 'Media', 'Baja'] as Population[],
  queenStatus: ['Vista', 'No vista', 'Celdas reales'] as QueenStatus[],
  foodReserve: ['Excelente', 'Buena', 'Escasa', 'Nula'] as FoodReserve[],
  hygiene: ['Bueno', 'Regular', 'Malo'] as Hygiene[],
  health: ['Sano', 'Varroa', 'Loque', 'Otro'] as HealthStatus[],
  method: ['Presión', 'Centrífuga'] as Method[],
  wax: ['Con cera', 'Sin cera'] as WaxOption[],
} as const;

export const HEALTH_TONE: Record<HealthStatus, string> = {
  Sano: 'var(--leaf)',
  Varroa: 'var(--alert)',
  Loque: 'var(--alert)',
  Otro: 'var(--honey-deep)',
};
