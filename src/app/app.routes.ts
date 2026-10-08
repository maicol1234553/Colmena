import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/auth.component').then((m) => m.AuthComponent),
    data: { animation: 'auth' },
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    data: { animation: 'dashboard' },
  },
  {
    path: 'hive/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/hive/hive-menu.component').then((m) => m.HiveMenuComponent),
    data: { animation: 'hive' },
  },
  {
    path: 'hive/:id/check',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/hive/check-form.component').then((m) => m.CheckFormComponent),
    data: { animation: 'form' },
  },
  {
    path: 'hive/:id/harvest',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/hive/harvest-form.component').then((m) => m.HarvestFormComponent),
    data: { animation: 'form' },
  },
  {
    path: 'hive/:id/history',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/hive/history.component').then((m) => m.HistoryComponent),
    data: { animation: 'form' },
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
