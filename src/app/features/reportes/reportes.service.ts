import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private base = `${environment.apiBase}/api/reportes`;

  constructor(private http: HttpClient) {}

  descargarInventarioPdf() {
    return this.http.get(`${this.base}/inventario/pdf`, {
      responseType: 'blob'
    });
  }

  descargarMovimientosPdf() {
    return this.http.get(`${this.base}/movimientos/pdf`, {
      responseType: 'blob'
    });
  }

  descargarInventarioExcel() {
    return this.http.get(`${this.base}/inventario/excel`, {
      responseType: 'blob'
    });
  }

  getResumenDashboard(): Observable<any> {
    return this.http.get(`${environment.apiBase}/api/dashboard/resumen`);
  }

  getProductos() {
    return this.http.get<any[]>(`${environment.apiBase}/api/productos`);
  }

  getMovimientosPorDia(params?: {desde?: string; hasta?: string}) {
    const q = new URLSearchParams();
    if (params?.desde) q.set('desde', params.desde);
    if (params?.hasta) q.set('hasta', params.hasta);
    const qs = q.toString();
    return this.http.get<any[]>(`${environment.apiBase}/api/dashboard/movimientos-por-dia${qs ? '?' + qs : ''}`);
  }

  getTopProductos(tipo: 'ENTRADA'|'SALIDA' = 'SALIDA', limit = 5, rango?: {desde?: string; hasta?: string}) {
    const q = new URLSearchParams();
    q.set('tipo', tipo);
    q.set('limit', String(limit));
    if (rango?.desde) q.set('desde', rango.desde);
    if (rango?.hasta) q.set('hasta', rango.hasta);
    return this.http.get<any[]>(`${environment.apiBase}/api/dashboard/top-productos?${q.toString()}`);
  }

  triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

