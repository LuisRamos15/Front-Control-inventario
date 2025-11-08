import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Movimiento {
  id: string;
  productoId: string;
  productoNombre: string;
  sku: string;
  cantidad: number;
  tipo: 'ENTRADA' | 'SALIDA';
  usuario: string;
  fecha: string;          
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
  number: number; 
}

@Injectable({ providedIn: 'root' })
export class MovimientosService {
  private base = `${environment.apiBase}/movimientos`;

  constructor(private http: HttpClient) {}

  listar(params: {
    page?: number; size?: number; sort?: string;
    desde?: string; hasta?: string; tipo?: 'ENTRADA'|'SALIDA'|''; sku?: string; productoId?: string;
  }): Observable<PageResp<Movimiento>> {
    let p = new HttpParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return this.http.get<PageResp<Movimiento>>(this.base, { params: p });
  }

  listarPaginado(params: {
    page?: number; size?: number; tipo?: 'ENTRADA' | 'SALIDA';
    desde?: string; hasta?: string; sort?: string;
  }) {
    const p: any = {};
    if (params.page !== undefined) p.page = params.page;
    if (params.size !== undefined) p.size = params.size;
    if (params.tipo) p.tipo = params.tipo;
    if (params.desde) p.desde = params.desde;
    if (params.hasta) p.hasta = params.hasta;
    if (params.sort) p.sort = params.sort;
    return this.http.get<PageResp<Movimiento>>(this.base, { params: p });
  }

  recientes(limit = 10): Observable<PageResp<Movimiento>> {
    return this.http.get<PageResp<Movimiento>>(`${this.base}/recientes`, { params: { limit } as any });
  }

  registrar(body: MovimientoCreate): Observable<void> {
    return this.http.post<void>(this.base, body);
  }
}

