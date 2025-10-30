import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';
import { Observable } from 'rxjs';
import { ToastData } from './toast.model';

@Component({
  selector: 'invpro-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  toasts$: Observable<ToastData[]>;

  constructor(private toastSvc: ToastService) {
    this.toasts$ = this.toastSvc.toasts$;
  }

  close(id: string) {
    this.toastSvc.remove(id);
  }

  trackById(index: number, item: ToastData): string {
    return item.id;
  }
}