import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout.component';
// (cuando tengamos InventarioComponent lo importamos aquí)

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'registro', component: RegisterComponent, canActivate: [GuestGuard] },
  { path: 'register', loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent), canActivate: [GuestGuard] },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },
       {
         path: 'inventario',
         loadComponent: () =>
           import('./features/inventario/pages/inventario/inventario.component')
             .then(m => m.InventarioComponent),
         title: 'Inventario'
       },
        {
          path: 'movimientos',
          loadComponent: () =>
            import('./features/movimientos/pages/movimientos/movimientos.component')
              .then(c => c.MovimientosComponent),
          title: 'Movimientos'
        },
        {
          path: 'alertas',
          loadComponent: () =>
            import('./features/alertas/alert-center.component')
              .then(m => m.AlertCenterComponent),
          title: 'Alertas'
        },
       // { path: 'reportes', component: ReportesComponent },
       { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
     ],
   },
   { path: '**', redirectTo: 'dashboard' },
];
