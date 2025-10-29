import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Movimiento {
  id: string;
  productoId: string;
  productoNombre: string;
  sku: string;
  cantidad: number;
  tipo: 'ENTRADA' | 'SALIDA';
  usuario: string;
  fecha: string;          // ISO Instant
  stockAntes: number;
  stockDespues: number;
}

export interface MovimientoCreate {
  productoId: string;
  cantidad: number;
  tipo: 'ENTRADA' | 'SALIDA';
}

export interface PageResp<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // page index
}

@Injectable({ providedIn: 'root' })
export class MovimientosService {
  constructor(private http: HttpClient) {}

  listar(params: {
    page?: number; size?: number; sort?: string;
    desde?: string; hasta?: string; tipo?: 'ENTRADA'|'SALIDA'|''; sku?: string; productoId?: string;
  }): Observable<PageResp<Movimiento>> {
    let p = new HttpParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return this.http.get<PageResp<Movimiento>>('/api/movimientos', { params: p });
  }

  recientes(limit = 10): Observable<PageResp<Movimiento>> {
    return this.http.get<PageResp<Movimiento>>('/api/movimientos/recientes', { params: { limit } as any });
  }

  registrar(body: MovimientoCreate): Observable<void> {
    return this.http.post<void>('/api/movimientos', body);
  }
}