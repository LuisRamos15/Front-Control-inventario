import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';

type Producto = {
  id: string; nombre: string; sku: string;
  categoria?: string; stock?: number; minimo?: number; precioUnitario?: number;
};

type TopProducto = { sku: string; nombre: string; cantidad: number; };

type Page<T> = { content: T[]; totalElements: number; };

type Movimiento = {
  fecha: string;
  tipo: 'ENTRADA' | 'SALIDA';
  sku?: string;
  productoNombre?: string;
  cantidad?: number;
};

@Injectable({ providedIn: 'root' })
export class ReportsService {

  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProductos() {
    return this.http.get<Producto[]>(`${this.base}/productos`);
  }

  getTopVendidos30d(limit = 5) {
    return this.http.get<TopProducto[]>(
      `${this.base}/dashboard/top-productos`,
      { params: { tipo: 'SALIDA', limit } as any }
    );
  }

  getMovimientos30d(pageSize = 1000) {
    const hoy = new Date();
    const desde = new Date(hoy); desde.setDate(hoy.getDate() - 30);
    const p = new HttpParams()
      .set('desde', desde.toISOString().slice(0,10))
      .set('hasta', hoy.toISOString().slice(0,10))
      .set('tipo', 'SALIDA')
      .set('page', '0')
      .set('size', String(pageSize))
      .set('sort', 'fecha,desc');
    return this.http.get<Page<Movimiento>>(`${this.base}/movimientos`, { params: p });
  }

  
  getKpis30d() {
    return forkJoin({
      productos: this.getProductos(),
      movs: this.getMovimientos30d()
    }).pipe(
      map(({ productos, movs }) => {
        const precios = new Map(productos.map(p => [p.sku ?? '', p.precioUnitario ?? 0]));
        const totalInventario = productos.reduce(
          (acc, p) => acc + (p.precioUnitario ?? 0) * (p.stock ?? 0), 0);
        const valorStockBajo = productos
          .filter(p => (p.stock ?? 0) <= (p.minimo ?? -1))
          .reduce((acc, p) => acc + (p.precioUnitario ?? 0) * (p.stock ?? 0), 0);
        const vendidosPorSku = new Map<string, number>();
        (movs.content ?? []).forEach(m => {
          if (m.tipo === 'SALIDA') {
            const q = (vendidosPorSku.get(m.sku ?? '') ?? 0) + (m.cantidad ?? 0);
            vendidosPorSku.set(m.sku ?? '', q);
          }
        });
        const valorVendido30d = Array.from(vendidosPorSku.entries())
          .reduce((acc, [sku, qty]) => acc + qty * (precios.get(sku) ?? 0), 0);
        const skusConMovimiento = new Set((movs.content ?? [])
          .map(m => m.sku ?? '').filter(Boolean));
        const sinMovimiento30d = productos
          .filter(p => !skusConMovimiento.has(p.sku ?? ''))
          .length;
        const categorias = new Set(productos.map(p => (p.categoria ?? '').trim()).filter(Boolean));
        return {
          totalProductos: productos.length,
          categoriasActivas: categorias.size,
          totalInventario,
          valorVendido30d,
          valorStockBajo,
          sinMovimiento30d
        };
      })
    );
  }
}

