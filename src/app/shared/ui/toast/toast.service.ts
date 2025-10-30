import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  timeout?: number; // ms
  key?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts$ = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this._toasts$.asObservable();

  private seq = 1;

  /** Evita mostrar el mismo toast mientras siga visible */
  private activeKeys = new Set<string>();

  show(type: ToastType, message: string, title?: string, timeout = 4200) {
    const key = `${type}|${title ?? ''}|${message}`;
    if (this.activeKeys.has(key)) return;           // <<--- evita duplicados
    this.activeKeys.add(key);
    const toast: Toast = { id: this.seq++, type, title, message, timeout };
    this._toasts$.next([...this._toasts$.value, toast]);
    if (timeout && timeout > 0) {
      setTimeout(() => {
        this.dismiss(toast.id);
        this.activeKeys.delete(key);                // libera la llave al cerrar
      }, timeout);
    }
  }

  success(msg: string, title?: string, t?: number) { this.show('success', msg, title, t); }
  info(msg: string, title?: string, t?: number)    { this.show('info',    msg, title, t); }
  warning(msg: string, title?: string, t?: number) { this.show('warning', msg, title, t); }
  error(msg: string, title?: string, t?: number)   { this.show('error',   msg, title, t); }

  dismiss(id: number) {
    this._toasts$.next(this._toasts$.value.filter(t => t.id !== id));
  }

  clear() {
    this._toasts$.next([]);
  }
}