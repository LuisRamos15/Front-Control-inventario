import { ApplicationRef, ComponentRef, Injectable, createComponent } from '@angular/core';
import { AlertModalComponent } from './alert-modal.component';

@Injectable({ providedIn: 'root' })
export class AlertModalService {
  private current?: ComponentRef<AlertModalComponent>;

  constructor(private appRef: ApplicationRef) {}

  open(opts: { title?: string; message: string; autoCloseMs?: number }): void {
    
    this.close();

    const compRef = createComponent(AlertModalComponent, { environmentInjector: this.appRef.injector });
    this.current = compRef;

    compRef.instance.title = opts.title ?? 'Advertencia';
    compRef.instance.message = opts.message;
    compRef.instance.autoCloseMs = opts.autoCloseMs ?? 4500;

    
    const originalClose = compRef.instance.close.bind(compRef.instance);
    compRef.instance.close = () => {
      originalClose();
      this.destroy();
    };

    this.appRef.attachView(compRef.hostView);
    document.body.appendChild(compRef.location.nativeElement);
  }

  close(): void {
    if (this.current) {
      this.appRef.detachView(this.current.hostView);
      this.current.destroy();
      this.current = undefined;
    }
  }

  private destroy(): void {
    this.close();
  }
}

