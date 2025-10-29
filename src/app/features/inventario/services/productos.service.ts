import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  categoria?: string;
  stock?: number;
  stockMaximo?: number;
  precioUnitario?: number;
  descripcion?: string;
  minimo?: number;
}

export interface ProductoCreate {
  sku: string;
  nombre: string;
  categoria: string;
  stockMaximo: number;
  precioUnitario: number;
  descripcion?: string | null;
  stock: number;     // <-- nuevo campo
  minimo: number;    // <-- fijo en 10
}

interface PageResp<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class ProductosService {
//  normaliza base: admite 'http://host:8080' o '/api'
private readonly apiRoot = (() => {
const raw = (environment.apiUrl || '').trim();
const withLeading = raw.startsWith('http') ? raw : `/${raw.replace(/^\/+/, '')}`;
const noTrail = withLeading.replace(/\/+$/, '');
return noTrail.endsWith('/api') ? noTrail : `${noTrail}/api`;
})();

//  usar la base normalizada
private base = `${this.apiRoot}/productos`;

  constructor(private http: HttpClient) {}

  /** Lista completa (array) */
  listarTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.base);
  }

  // lista con búsqueda (paginada del backend)
  listar(q?: string): Observable<Producto[]> {
    if (!q || !q.trim()) {
      return this.listarTodos();
    }
    const params = new HttpParams().set('q', q.trim());
    return this.http.get<PageResp<Producto>>(`${this.base}/search`, { params }).pipe(map(p => p.content));
  }

  /** Búsqueda remota: el back devuelve Page -> devolvemos solo content como array */
  buscar(q: string, size = 200): Observable<Producto[]> {
    const params = new HttpParams()
      .set('q', q)
      .set('page', 0)
      .set('size', size);
    return this.http
      .get<PageResp<Producto>>(`${this.base}/search`, { params })
      .pipe(map(res => res?.content ?? []));
  }

  crearProducto(body: ProductoCreate): Observable<Producto> {
    return this.http.post<Producto>('/api/productos', body);
  }

  /** PATCH parcial de un producto (sin SKU ni stock). */
  actualizarProducto(
    id: string,
    body: Partial<{
      nombre: string;
      categoria: string;
      descripcion: string | null;
      precioUnitario: number;
      minimo: number;
      stockMaximo: number;
    }>
  ): Observable<Producto> {
    return this.http.patch<Producto>(`/api/productos/${id}`, body);
  }

  /** DELETE producto por id. */
  eliminarProducto(id: string): Observable<{ message?: string; id?: string }> {
    return this.http.delete<{ message?: string; id?: string }>(`/api/productos/${id}`);
  }
}