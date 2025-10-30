import { ApplicationRef, ComponentRef, Injectable, Injector, createComponent } from '@angular/core';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private ref?: ComponentRef<InfoDialogComponent>;

  constructor(private appRef: ApplicationRef, private injector: Injector) {}

  show(message: string, title = 'Aviso', primaryLabel = 'Aceptar') {
    if (this.ref) this.close(); // evitar duplicados

    const comp = createComponent(InfoDialogComponent, { environmentInjector: this.appRef.injector, elementInjector: this.injector });

    comp.instance.title = title;
    comp.instance.message = message;
    comp.instance.primaryLabel = primaryLabel;
    comp.instance.close.subscribe(() => this.close());

    this.appRef.attachView(comp.hostView);
    document.body.appendChild(comp.location.nativeElement);
    this.ref = comp;
  }

  close() {
    if (!this.ref) return;
    this.appRef.detachView(this.ref.hostView);
    this.ref.destroy();
    this.ref = undefined;
  }
}