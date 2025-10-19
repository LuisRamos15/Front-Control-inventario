import { Component, signal, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { DashboardService, Resumen, TopProducto, DiaMov } from './dashboard.service';

import { AuthService } from '../../core/services/auth.service';
import { ChartConfiguration, ChartType, Chart, registerables } from 'chart.js';
import { BaseChartDirective, provideCharts } from 'ng2-charts';
import { AlertaEvent } from './models/alerta.model';
import { catchError, of } from 'rxjs';

Chart.register(...registerables);

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [NgFor, NgIf, NgClass, BaseChartDirective],
  providers: [provideCharts({})],
  template: `
  <div class="page">

    <div class="title-row">
      <div class="title">Bienvenido al Panel de Control</div>
      <div class="status"><span class="dot"></span> En línea</div>
    </div>

    <div class="kpis">
      <div class="kpi">
        <div class="icon circ blue">👥</div>
        <div>
          <div class="desc">Total de Productos</div>
          <div class="val">{{resumen()?.totalProductos ?? '—'}}</div>
        </div>
      </div>
      <div class="kpi">
        <div class="icon circ amber">⚠️</div>
        <div>
          <div class="desc">Stock Bajo</div>
          <div class="val">{{resumen()?.stockBajo ?? '—'}}</div>
        </div>
      </div>
      <div class="kpi">
        <div class="icon circ green">⬆️</div>
        <div>
          <div class="desc">Movimientos Hoy</div>
          <div class="val">{{resumen()?.movimientosHoy ?? '—'}}</div>
        </div>
      </div>
      <div class="kpi">
        <div class="icon circ red">🔔</div>
        <div>
          <div class="desc">Alertas Activas</div>
          <div class="val">{{resumen()?.alertasActivas ?? '—'}}</div>
        </div>
      </div>
    </div>

    <div class="charts">
        <div class="card">
        <div class="card-title">Movimientos por Tipo</div>
        <div class="chart-box">
          <canvas baseChart [data]="barData" [options]="barOptions" [type]="barType"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Rotación de Productos</div>
        <ul class="top-list">
          <li *ngFor="let p of top()">
            <span class="sku">{{p.sku}}</span>
            <span class="name">{{p.nombre}}</span>
            <span class="qty">{{p.cantidad}}</span>
          </li>
        </ul>
      </div>
    </div>

      <div class="card alerts" *ngIf="isAdmin">
        <div class="card-title">Alertas Recientes</div>
        <div *ngIf="cargandoAlertas" class="alert-row info">Cargando alertas...</div>
        <div *ngFor="let a of alertas" class="alert-row" [ngClass]="a.nivel === 'STOCK_CRITICO' ? 'warn' : 'low'">
          <strong>{{a.mensaje}}</strong> {{a.productoNombre}} ({{a.sku}}) - Stock: {{a.stock}} / Mínimo: {{a.minimo}}
        </div>
        <div *ngIf="!cargandoAlertas && alertas.length === 0" class="alert-row info">Sin alertas recientes.</div>
      </div>

  </div>
  `,
   styles: [`
   .page { display:flex; flex-direction:column; gap:16px; }
   .title-row { display:flex; align-items:center; gap:12px; }
   .title-row .status { display: none; }
   .title { font-size:20px; font-weight:700; }
   .status { margin-left:auto; background:#e8f5e9; color:#2e7d32; padding:6px 10px; border-radius:10px; font-size:12px; display:flex; align-items:center; gap:6px; }
   .status .dot { width:8px; height:8px; border-radius:50%; background:#2ecc71; display:inline-block; }

  .kpis { display:grid; grid-template-columns: repeat(4, 1fr); gap:14px; }
  .kpi { background:#fff; border-radius:12px; padding:16px; box-shadow: 0 2px 10px rgba(13,71,161,.06); display:flex; align-items:center; gap:12px; }
  .icon.circ { width:42px; height:42px; border-radius:50%; display:grid; place-items:center; color:#fff; font-size:18px; }
  .icon.blue { background:#2d7ff9; }
  .icon.amber { background:#ffb300; }
  .icon.green { background:#2e7d32; }
  .icon.red { background:#e53935; }
  .desc { font-size:12px; opacity:.8; }
  .val { font-size:22px; font-weight:800; letter-spacing:.4px; }

  .charts { display:grid; grid-template-columns: 1fr 1fr; gap:14px; min-height:320px; }
  .chart-box { height: 280px; }
  .card { background:#fff; border-radius:12px; padding:16px; box-shadow: 0 2px 10px rgba(13,71,161,.06); }
  .card-title { font-weight:700; margin-bottom:8px; }
  .top-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px; }
  .top-list li { display:grid; grid-template-columns: 120px 1fr 60px; gap:10px; }
  .sku { color:#5a6; font-weight:600; }
  .name { opacity:.9; }
  .qty { text-align:right; font-weight:700; }

  .alerts .alert-row { padding:10px 12px; border-radius:10px; margin-bottom:8px; font-size:14px; }
  .alerts .warn { background:#ffebee; color:#c62828; }
  .alerts .low { background:#fff8e1; color:#b08900; }
  .alerts .info { background:#e3f2fd; color:#1565c0; }
  `]
})
export class DashboardComponent implements OnInit {
  private resumenSig = signal<Resumen | null>(null);
  resumen = () => this.resumenSig();

  private topSig = signal<TopProducto[]>([]);
  top = () => this.topSig();

  isAdmin = false;
  loadingAlertas = false;

  alertas: AlertaEvent[] = [];
  cargandoAlertas = false;

  barType: ChartType = 'bar';
  barData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  barOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: { x: { stacked: false }, y: { beginAtZero: true } }
  };

  constructor(private api: DashboardService, private auth: AuthService) {
    this.cargar();
  }

  ngOnInit(): void {
    this.isAdmin = this.auth.getPrimaryRole() === 'ADMIN';
    if (this.isAdmin) {
      this.cargarAlertas();
    }
  }

  private cargar() {
    this.api.resumen().subscribe((r: Resumen) => this.resumenSig.set(r));

    const hoy = new Date();
    const desde = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const hasta = hoy.toISOString().split('T')[0];
    this.api.movimientosPorDia(desde, hasta).subscribe((rows: DiaMov[]) => {
      const labels = rows.map((r: DiaMov) => r.fecha);
      const entradas = rows.map((r: DiaMov) => r.entradas);
      const salidas = rows.map((r: DiaMov) => r.salidas);
      this.barData = {
        labels,
        datasets: [
          { label: 'Entradas', data: entradas },
          { label: 'Salidas', data: salidas }
        ]
      };
    });

    this.api.topProductos('SALIDA', 5, desde, hasta).subscribe((t: TopProducto[]) => this.topSig.set(t));
  }

  private cargarAlertas(): void {
    this.cargandoAlertas = true;
    this.api.getAlertas(10).pipe(
      catchError(err => {
        if (err?.status === 403) {
          this.isAdmin = false;
          return of<AlertaEvent[]>([]);
        }
        return of<AlertaEvent[]>([]);
      })
    ).subscribe(list => {
      this.alertas = list ?? [];
      this.cargandoAlertas = false;
    });
  }
}
