import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-protected-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="app-header">
    <div class="user-menu">
      <button class="user-btn" (click)="toggleMenu()" aria-label="User menu">
        Admin ▾
      </button>
      <div class="dropdown" [class.show]="menuOpen">
        <a class="dropdown-item" routerLink="/perfil">Perfil</a>
        <hr class="dropdown-divider">
        <a class="dropdown-item text-danger" (click)="logout()">Cerrar sesión</a>
      </div>
    </div>
  </div>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="cube"></div>
        <div class="titles">
          <div class="app">InventarioPRO</div>
          <div class="sub">Sistema Inteligente</div>
        </div>
      </div>

      <div class="tech-badges">
        <span class="badge">Angular</span>
        <span class="badge">Spring Boot</span>
        <span class="badge">MongoDB</span>
      </div>

      <nav class="menu">
        <a routerLink="/dashboard" routerLinkActive="active">
          <i class="icon">📊</i> <span>Dashboard</span>
        </a>
        <a class="disabled">
          <i class="icon">📦</i> <span>Inventario</span>
        </a>
        <a class="disabled">
          <i class="icon">🔁</i> <span>Movimientos</span>
        </a>
        <a class="disabled">
          <i class="icon">🔔</i> <span>Alertas</span>
        </a>
        <a class="disabled">
          <i class="icon">📑</i> <span>Reportes</span>
        </a>
      </nav>
    </aside>

    <main class="content">
      <router-outlet />
    </main>
  </div>
  `,
  styles: [`
  :host { display: block; height: 100vh; }
  .app-header { background: #fff; border-bottom: 1px solid #e0e0e0; padding: 8px 22px; display: flex; justify-content: flex-end; align-items: center; }
  .user-btn { background: #eef2ff; color: #0d47a1; padding: 6px 10px; border-radius: 10px; font-size: 12px; border: none; cursor: pointer; }
  .dropdown { position: absolute; top: 40px; right: 22px; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,.1); display: none; min-width: 150px; z-index: 1000; }
  .dropdown.show { display: block; }
  .dropdown-item { display: block; padding: 8px 12px; color: #333; text-decoration: none; }
  .dropdown-item:hover { background: #f5f5f5; }
  .dropdown-item.text-danger { color: #dc3545; }
  .dropdown-divider { margin: 0; border-top: 1px solid #e0e0e0; }

  .shell { display: grid; grid-template-columns: 260px 1fr; background: #f6f8ff; height: calc(100vh - 50px); }
  .sidebar {
    background: linear-gradient(180deg, #0d47a1, #0b4192);
    color: #fff; padding: 16px 12px; display: flex; flex-direction: column; gap: 16px;
  }
  .brand { display:flex; gap:12px; align-items:center; padding:8px 10px; }
  .cube { width: 42px; height: 42px; background: #fff; border-radius: 12px; box-shadow: inset 0 0 0 6px #0d47a1; }
  .titles .app { font-weight: 700; letter-spacing:.2px; }
  .titles .sub { font-size: 12px; opacity:.8; margin-top:2px; }
  .tech-badges { display:flex; gap:8px; padding: 6px 10px; }
  .badge { background:#184fb0; border:1px solid #2d63c4; padding:4px 8px; border-radius:10px; font-size:12px; }
  .menu { display:flex; flex-direction:column; gap:6px; margin-top:8px; }
  .menu a {
    color:#e7efff; text-decoration:none; padding:12px 12px; border-radius:12px;
    display:flex; align-items:center; gap:10px; opacity:.92;
  }
  .menu a:hover { background:#1a54bd; }
  .menu a.active { background:#1e60d8; box-shadow: 0 2px 10px rgba(0,0,0,.15); }
  .menu a.disabled { opacity:.6; cursor: not-allowed; }
  .icon { width:20px; text-align:center; }
  .content { padding: 22px; overflow:auto; }
  `]
})
export class ProtectedShellComponent {
  menuOpen = false;

  constructor(private auth: AuthService, private router: Router) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.auth.clearToken();
    this.router.navigate(['/login']);
  }
}