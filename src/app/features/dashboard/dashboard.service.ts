import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AlertaEvent } from '../../shared/models/alerta.model';
import { environment } from '../../../environments/environment';

export interface Resumen {
  totalProductos: number;
  stockBajo: number;
  movimientosHoy: number;
  alertasActivas: number;
}
export interface DiaMov {
  fecha: string; entradas: number; salidas: number; total: number;
}
export interface TopProducto { sku: string; nombre: string; cantidad: number; }

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private base = `${environment.apiUrl}/api/dashboard`;
  constructor(private http: HttpClient) {}

  resumen() {
    return this.http.get<Resumen>(`${this.base}/resumen`);
  }

  movimientosPorDia(desde?: string, hasta?: string) {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<DiaMov[]>(`${this.base}/movimientos-por-dia`, { params });
  }

  topProductos(tipo = 'SALIDA', limit = 5, desde?: string, hasta?: string) {
    let params = new HttpParams().set('tipo', tipo).set('limit', limit);
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<TopProducto[]>(`${this.base}/top-productos`, { params });
  }

  getAlertas(limit = 10) {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<AlertaEvent[]>(`${this.base}/alertas`, { params });
  }
}

