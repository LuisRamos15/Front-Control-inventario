import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.css']
})
export class InfoDialogComponent {
  @Input() open = false;
  @Input() title = 'Aviso';
  @Input() message = '';
  @Input() primaryLabel = 'Aceptar';
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}