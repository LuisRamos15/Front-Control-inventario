import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-protected-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
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
  :host, .shell { display: block; height: 100vh; }
  .shell { display: grid; grid-template-columns: 260px 1fr; background: #f6f8ff; }
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
export class ProtectedShellComponent {}