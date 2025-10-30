import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';

@Component({
  selector: 'invpro-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule]
})
export class AlertModalComponent implements OnInit {
  @Input() title = 'Advertencia';
  @Input() message = 'Ocurrió un aviso.';
  @Input() autoCloseMs = 4500;

  visible = true;

  ngOnInit(): void {
    if (this.autoCloseMs > 0) {
      setTimeout(() => this.close(), this.autoCloseMs);
    }
  }

  close(): void {
    this.visible = false;
  }
}