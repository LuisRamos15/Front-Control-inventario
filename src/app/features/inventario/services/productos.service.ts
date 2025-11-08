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
  stock: number;     
  minimo: number;    
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

private readonly apiRoot = environment.apiBase;


private base = `${this.apiRoot}/productos`;

  constructor(private http: HttpClient) {}

  
  listarTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.base);
  }

  listar(q?: string): Observable<Producto[]> {
    if (!q || !q.trim()) {
      return this.listarTodos();
    }
    const params = new HttpParams().set('q', q.trim());
    return this.http.get<PageResp<Producto>>(`${this.base}/search`, { params }).pipe(map(p => p.content));
  }

  
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
    return this.http.post<Producto>(this.base, body);
  }

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
    return this.http.patch<Producto>(`${this.base}/${id}`, body);
  }

  
  eliminarProducto(id: string): Observable<{ message?: string; id?: string }> {
    return this.http.delete<{ message?: string; id?: string }>(`${this.base}/${id}`);
  }
}

