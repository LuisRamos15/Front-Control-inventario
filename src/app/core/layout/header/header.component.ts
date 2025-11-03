import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  open = false;
  private router = inject(Router);
  public auth = inject(AuthService);

  toggle() { this.open = !this.open; }

  close() { this.open = false; }

  getRoleLabel(): string {
    // 1) Prioridad por guardias existentes
    if ((this.auth as any)?.hasRole?.('ADMIN')) return 'Administrador';
    if ((this.auth as any)?.hasRole?.('SUPERVISOR')) return 'Supervisor';
    if ((this.auth as any)?.hasRole?.('OPERADOR')) return 'Operador';
    // 2) Fallback si el usuario trae roles en el objeto
    try {
      const u = (this.auth as any)?.getCurrentUser?.() || (this.auth as any)?.userSubject?.value || null;
      const role = (u?.rol || u?.role || '').toString().toUpperCase().trim();
      const labels: Record<string, string> = { ADMIN: 'Administrador', SUPERVISOR: 'Supervisor', OPERADOR: 'Operador' };
      return labels[role] ?? '';
    } catch { return ''; }
  }

  getDisplayName(): string {
    const u = (this.auth as any)?.getCurrentUser?.() || (this.auth as any)?.userSubject?.value || null;
    return (u?.nombreUsuario || u?.username || '').toString();
  }

   logout() {
     this.auth.clear();
     this.auth.refreshFromToken();
     this.close();
     this.router.navigate(['/login'], { replaceUrl: true });
   }
}

