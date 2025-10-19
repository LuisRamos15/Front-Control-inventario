import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface AlertaRes {
  tipo: 'STOCK_CRITICO' | 'STOCK_BAJO' | 'MOVIMIENTO_INUSUAL';
  titulo: string;
  detalle: string;
  nivel: 'danger' | 'warning' | 'info';
  fecha: string; // ISO
}

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private base = '/api/dashboard';
  constructor(private http: HttpClient) {}

  recientes(limit = 3) {
    return this.http.get<AlertaRes[]>(`${this.base}/alertas-recientes?limit=${limit}`);
  }
}