import { Routes } from '@angular/router';
import { tokenGuard } from './core/guards/token.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [tokenGuard],
    loadComponent: () =>
      import('./features/upload/upload').then((m) => m.UploadComponent),
  },
  {
    path: 'no-access',
    loadComponent: () =>
      import('./features/no-access/no-access').then((m) => m.NoAccessComponent),
  },
  { path: '**', redirectTo: '' },
];
