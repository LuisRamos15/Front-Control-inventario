import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { ReportesService } from '../reportes.service';
import { LiveUpdatesService } from '../../../core/realtime/live-updates.service';
import { DashboardService } from '../../../core/realtime/dashboard';
import { TopProducto } from '../../../shared/models/dashboard.models';
import { finalize } from 'rxjs/operators';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-reportes-page',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe],
  templateUrl: './reportes-page.component.html',
  styleUrls: ['./reportes-page.component.scss']
})
export class ReportesPageComponent implements OnInit, AfterViewInit, OnDestroy {
  cargando = false;
  totalProductos = 0;
  valorTotal = 0;
  productosBajos = 0;
  categorias = 0;
  topProductos: TopProducto[] = [];
  loadingTop = false;

  @ViewChild('trendCanvas', { static: false }) trendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('consumoCanvas', { static: false }) consumoCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('rotacionCanvas', { static: false }) rotacionCanvas!: ElementRef<HTMLCanvasElement>;

  private trendChart?: Chart;
  private consumoChart?: Chart;
  private rotacionChart?: Chart;

  constructor(private reportes: ReportesService, private liveUpdates: LiveUpdatesService, private dashboardSrv: DashboardService) {}

  ngOnInit(): void {
    this.reportes.getResumenDashboard().subscribe({
      next: (d) => {
        this.totalProductos = d?.totalProductos ?? 0;
        this.productosBajos = d?.stockBajo ?? 0;
        
        this.reportes.getProductos().subscribe({
          next: (ps) => {
            
            this.valorTotal = (ps ?? []).reduce((acc, p) => {
              const precio = Number(p?.precioUnitario) || 0;
              const stock  = Number(p?.stock) || 0;
              return acc + (precio * stock);
            }, 0);
            
            const categoriasSet = new Set(
              (ps ?? [])
                .map(p => (p?.categoria ?? '').trim())
                .filter(Boolean)
            );
            this.categorias = categoriasSet.size;
          },
          error: (e) => {
            console.error('Error cargando productos para KPIs de reportes', e);
            
            this.valorTotal = 0;
            this.categorias  = 0;
          }
        });
      },
      error: (e) => console.error('Error al cargar resumen:', e)
    });

    
    this.loadTopProductos();

    
    this.liveUpdates.init();

    
    this.liveUpdates.productos$().subscribe(() => {
      
      this.reportes.getProductos().subscribe(ps => {
        this.valorTotal = (ps ?? []).reduce((acc, p) => {
          const precio = Number(p?.precioUnitario) || 0;
          const stock = Number(p?.stock) || 0;
          return acc + (precio * stock);
        }, 0);
        const categoriasSet = new Set(
          (ps ?? [])
            .map(p => (p?.categoria ?? '').trim())
            .filter(Boolean)
        );
        this.categorias = categoriasSet.size;
      });
    });

    this.liveUpdates.movimientos$().subscribe(() => {
      
      this.reportes.getMovimientosPorDia().subscribe(dias => {
        const labels = dias.map(d => d.fecha);
        const entradas = dias.map(d => d.entradas ?? 0);
        const salidas = dias.map(d => d.salidas ?? 0);
        if (this.trendChart) {
          this.trendChart.data.labels = labels;
          this.trendChart.data.datasets[0].data = entradas;
          this.trendChart.data.datasets[1].data = salidas;
          this.trendChart.update();
        }
        const salidas2 = dias.map(d => d.salidas ?? 0);
        const mm7 = this.movingAverage(salidas2, 7);
        if (this.rotacionChart) {
          this.rotacionChart.data.labels = labels;
          this.rotacionChart.data.datasets[0].data = salidas2;
          this.rotacionChart.data.datasets[1].data = mm7;
          this.rotacionChart.update();
        }
      });
      this.reportes.getTopProductos('SALIDA', 5).subscribe(items => {
        const labels = items.map(x => x.nombre || x.sku || 'N/A');
        const data = items.map(x => x.cantidad ?? 0);
        if (this.consumoChart) {
          this.consumoChart.data.labels = labels;
          this.consumoChart.data.datasets[0].data = data;
          this.consumoChart.update();
        }
      });
    });
  }

  private loadTopProductos(): void {
    this.loadingTop = true;
    const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const hasta = new Date().toISOString().split('T')[0];
    this.dashboardSrv.getTopProductos('SALIDA', 5, desde, hasta).subscribe({
      next: (data) => { this.topProductos = Array.isArray(data) ? data : []; },
      error: (_) => { this.topProductos = []; },
      complete: () => { this.loadingTop = false; }
    });
  }

  ngAfterViewInit(): void {
    
    this.reportes.getMovimientosPorDia().subscribe(dias => {
      const labels  = dias.map(d => d.fecha);
      const entradas = dias.map(d => d.entradas ?? 0);
      const salidas  = dias.map(d => d.salidas ?? 0);
      const cfg: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Entradas', data: entradas },
            { label: 'Salidas',  data: salidas  }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: { x: { stacked: false }, y: { beginAtZero: true } }
        }
      };
      this.trendChart = new Chart(this.trendCanvas.nativeElement.getContext('2d')!, cfg);
    });

    
    this.reportes.getTopProductos('SALIDA', 5).subscribe(items => {
      const labels = items.map(x => x.nombre || x.sku || 'N/A');
      const data   = items.map(x => x.cantidad ?? 0);
      const cfg: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Unidades', data }] },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true } }
        }
      };
      this.consumoChart = new Chart(this.consumoCanvas.nativeElement.getContext('2d')!, cfg);
    });

    
    this.reportes.getMovimientosPorDia().subscribe(dias => {
      const labels  = dias.map(d => d.fecha);
      const salidas = dias.map(d => d.salidas ?? 0);
      const mm7 = this.movingAverage(salidas, 7);
      const cfg: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Salidas diarias', data: salidas, tension: 0.3 },
            { label: 'Media móvil 7d',  data: mm7,     borderDash: [6,4], tension: 0.3 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: { y: { beginAtZero: true } }
        }
      };
      this.rotacionChart = new Chart(this.rotacionCanvas.nativeElement.getContext('2d')!, cfg);
    });
  }

  private movingAverage(series: number[], win = 7): number[] {
    const out: number[] = [];
    for (let i = 0; i < series.length; i++) {
      const start = Math.max(0, i - win + 1);
      const sum = series.slice(start, i + 1).reduce((a, b) => a + b, 0);
      out.push(sum / (i - start + 1));
    }
    return out;
  }

  onExportarExcel() {
    this.cargando = true;
    this.reportes.descargarInventarioExcel()
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (blob) => this.reportes.triggerDownload(blob, 'inventario.xlsx'),
        error: (e) => console.error('Error Excel', e)
      });
  }

  onExportarPdfInventario() {
    this.cargando = true;
    this.reportes.descargarInventarioPdf()
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (blob) => this.reportes.triggerDownload(blob, 'inventario.pdf'),
        error: (e) => console.error('Error PDF inventario', e)
      });
  }

  onExportarPdfMovimientos() {
    this.cargando = true;
    this.reportes.descargarMovimientosPdf()
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (blob) => this.reportes.triggerDownload(blob, 'movimientos.pdf'),
        error: (e) => console.error('Error PDF movimientos', e)
      });
  }

  onImprimir() {
    
    const section = document.getElementById('printArea');
    if (!section) return window.print();
    const w = window.open('', 'PRINT', 'height=600,width=900');
    if (!w) return;
    w.document.write('<html><head><title>Reportes</title>');
    w.document.write(
      `<style>
        body { font-family: system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; }
        .cards { display:grid; grid-template-columns: repeat(4, minmax(180px,1fr)); gap:12px; margin-top:16px;}
        .card { padding:12px 14px; border-radius:12px; box-shadow: 0 1px 3px rgba(0,0,0,.08); border:1px solid #eef1f5;}
        h2 { margin: 8px 0 0; font-size: 18px; }
        .muted { color:#6b7280; font-size:12px; }
      </style>`
    );
    w.document.write('</head><body>');
    w.document.write(section.innerHTML);
    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    w.print();
    w.close();
  }

  ngOnDestroy(): void {
    this.trendChart?.destroy();
    this.consumoChart?.destroy();
    this.rotacionChart?.destroy();
  }
}

