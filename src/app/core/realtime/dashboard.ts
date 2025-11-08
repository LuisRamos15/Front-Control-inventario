import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resumen, MovimientoDia, TopProducto } from '../../shared/models/dashboard.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private base = `${environment.apiBase}/api/dashboard`;

  constructor(private http: HttpClient) {}

  getResumen(): Observable<Resumen> {
    return this.http.get<Resumen>(`${this.base}/resumen`);
  }

  getMovimientosPorDia(desde: string, hasta: string): Observable<MovimientoDia[]> {
    return this.http.get<MovimientoDia[]>(`${this.base}/movimientos-por-dia?desde=${desde}&hasta=${hasta}`);
  }

  getTopProductos(tipo: string, limit: number, desde: string, hasta: string): Observable<TopProducto[]> {
    return this.http.get<TopProducto[]>(`${this.base}/top-productos?tipo=${tipo}&limit=${limit}&desde=${desde}&hasta=${hasta}`);
  }
}

