import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-success-modal',
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SuccessModalComponent {
  @Input() open = false;
  @Input() message = 'Operación exitosa';

  close(): void {
    this.open = false;
  }
}