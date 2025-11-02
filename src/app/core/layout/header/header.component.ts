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

  getUserRoleLabel(): string {
    try {
      const role = this.auth.getPrimaryRole() || '';
      const labels: Record<string, string> = {
        ADMIN: 'Administrador',
        SUPERVISOR: 'Supervisor',
        OPERADOR: 'Operador'
      };
      // Si no hay rol reconocido, no mostrar Usuario: devolver cadena vacía
      return labels[role] ?? '';
    } catch {
      return '';
    }
  }

   logout() {
     this.auth.clear();
     this.auth.refreshFromToken();
     this.close();
     this.router.navigate(['/login'], { replaceUrl: true });
   }
}

