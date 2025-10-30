import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Toast, ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.css']
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub?: Subscription;

  constructor(private toast: ToastService) {}

  ngOnInit() {
    this.sub = this.toast.toasts$.subscribe(list => this.toasts = list);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  dismiss(id: number) {
    this.toast.dismiss(id);
  }

  icon(t: Toast['type']) {
    switch (t) {
      case 'success': return '✓';
      case 'info':    return 'ℹ';
      case 'warning': return '⚠';
      case 'error':   return '✕';
    }
  }
}