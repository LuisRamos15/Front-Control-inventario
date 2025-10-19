import { Routes } from '@angular/router';
import { AuthGuard, AuthMatchGuard } from './core/guards/auth.guard';
import { GuestGuard, GuestMatchGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Públicas
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
    canMatch: [GuestMatchGuard],
    canActivate: [GuestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent),
    canMatch: [GuestMatchGuard],
    canActivate: [GuestGuard],
  },

  // Protegidas (shell con sidebar)
  {
    path: '',
    loadComponent: () =>
      import('./layout/protected-shell.component').then(m => m.ProtectedShellComponent),
    canMatch: [AuthMatchGuard],        // bloquea el lazy-load si no hay token
    canActivate: [AuthGuard],          // bloquea la navegación directa
    canActivateChild: [AuthGuard],     // bloquea cualquier child route
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      // aquí irán más rutas protegidas
    ],
  },

  { path: '**', redirectTo: 'login' },
];
