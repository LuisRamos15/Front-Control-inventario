import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login';
import { RegisterComponent } from './features/auth/pages/register/register';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
   { path: 'ok', loadComponent: () => import('./features/ok/ok.component').then(m => m.OkComponent) },
  // (otras futuras)
  // { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], data: { roles: ['ADMIN','SUPERVISOR','OPERADOR'] } },
  { path: '**', redirectTo: 'login' }
];
