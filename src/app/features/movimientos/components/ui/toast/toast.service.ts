import { ApplicationRef, Injectable, ComponentRef, createComponent } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastData, ToastVariant } from './toast.model';
import { ToastContainerComponent } from './toast-container.component';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = new BehaviorSubject<ToastData[]>([]);
  toasts$ = this._toasts.asObservable();
  private containerRef?: ComponentRef<ToastContainerComponent>;

  constructor(private appRef: ApplicationRef) {}

  private ensureContainer() {
    if (this.containerRef) return;
    const ref = createComponent(ToastContainerComponent, { environmentInjector: this.appRef.injector! });
    this.containerRef = ref;
    this.appRef.attachView(ref.hostView);
    document.body.appendChild(ref.location.nativeElement);
  }

  show(opts: { title?: string; message: string; variant?: ToastVariant; timeoutMs?: number }) {
    this.ensureContainer();
    const toast: ToastData = {
      id: crypto.randomUUID(),
      title: opts.title,
      message: opts.message,
      variant: opts.variant ?? 'info',
      timeoutMs: opts.timeoutMs ?? 5000
    };
    const list = this._toasts.getValue();
    this._toasts.next([toast, ...list]);
    if (toast.timeoutMs && toast.timeoutMs > 0) {
      setTimeout(() => this.remove(toast.id), toast.timeoutMs);
    }
  }

  warning(message: string, title = 'Advertencia', timeoutMs = 5000) {
    this.show({ title, message, variant: 'warning', timeoutMs });
  }

  success(message: string, title = 'Éxito', timeoutMs = 4000) {
    this.show({ title, message, variant: 'success', timeoutMs });
  }

  error(message: string, title = 'Error', timeoutMs = 6000) {
    this.show({ title, message, variant: 'error', timeoutMs });
  }

  remove(id: string) {
    const list = this._toasts.getValue().filter(t => t.id !== id);
    this._toasts.next(list);
  }
}