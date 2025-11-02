import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {
  @Input() items: string[] = [];
  @Input() buttonText: string = 'Dropdown';
  @Output() itemSelected = new EventEmitter<string>();

  selectItem(item: string) {
    this.itemSelected.emit(item);
  }
}

