import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from './websocket.service';

export type AlertaNivel = 'CRITICA' | 'ADVERTENCIA' | 'INFO';

export type AlertaStatus = 'NUEVA' | 'RECONOCIDA' | 'RESUELTA';

export interface AlertaItem {
  id: string;
  mensaje: string;
  productoNombre: string;
  sku: string;
  stock: number;
  minimo: number;
  nivel: AlertaNivel;
  fecha: string;
  status?: AlertaStatus;
  createdAt?: string;
  resolvedAt?: string;
}

export interface AlertaEvent {
  mensaje: string;
  productoNombre: string;
  sku: string;
  stock: number;
  minimo: number;
  nivel: string;
  fecha: string;
}

const LS_KEY = 'inventariopro.alertas';

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private readonly _list$ = new BehaviorSubject<AlertaItem[]>(this.load());
  readonly list$ = this._list$.asObservable();

  private readonly baseUrl = '/api/alertas';

  constructor(
    private readonly http: HttpClient,
    private readonly ws: WebSocketService
  ) {}

  /** Llamar UNA sola vez (por ejemplo, en AppComponent ngOnInit) */
  initWsListener(): void {
    // SUSCRIBIRSE a /topic/alertas usando la conexión existente
    this.ws.alertas$.subscribe((payload: any) => {
      try {
        const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
        this.upsertFromWs(data);
      } catch {
        this.upsertFromWs(payload);
      }
    });
  }

  /** Inserta o actualiza por id (WS). No romper orden ni UI. */
  private upsertFromWs(incoming: Partial<AlertaItem>): void {
    const id = incoming.id ?? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
    const next: AlertaItem = {
      id,
      mensaje: incoming.mensaje ?? '',
      productoNombre: incoming.productoNombre ?? '',
      sku: incoming.sku ?? '',
      stock: Number(incoming.stock ?? 0),
      minimo: Number(incoming.minimo ?? 0),
      nivel: (incoming.nivel as AlertaNivel) ?? 'INFO',
      fecha: incoming.fecha ?? new Date().toISOString(),
      status: (incoming.status as AlertaStatus) ?? 'NUEVA',
    };
    const list = [...this._list$.value];
    const idx = list.findIndex(a => a.id === next.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...next };
    } else {
      list.unshift(next);
    }
    this._list$.next(list);
    this.save(list);
  }

  private load(): AlertaItem[] {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch { return []; }
  }

  private save(list: AlertaItem[]) { localStorage.setItem(LS_KEY, JSON.stringify(list)); }

  list() { return this._list$.value; }

  setStatus(id: string, status: AlertaStatus) {
    const list = this._list$.value.map(a =>
      a.id === id ? { ...a, status, resolvedAt: status === 'RESUELTA' ? new Date().toISOString() : undefined } : a
    );
    this._list$.next(list);
    this.save(list);
  }

  // Métodos HTTP pensados para cuando el backend de alertas esté listo.
  reconocer(id: string) {
    return this.http.patch<AlertaItem>(`${this.baseUrl}/${id}/reconocer`, {});
  }

  resolver(id: string) {
    return this.http.patch<AlertaItem>(`${this.baseUrl}/${id}/resolver`, {});
  }

  listar(params?: any) {
    return this.http.get<any>(this.baseUrl, { params });
  }

  // Keep the old method for compatibility
  recientes(limit = 3) {
    return this.list$.pipe(map(alerts => alerts.slice(0, limit)));
  }
}