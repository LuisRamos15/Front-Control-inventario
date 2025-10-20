import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductosService, ProductoCreate } from '../../services/productos.service';

@Component({
  selector: 'app-producto-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-modal.component.html',
  styleUrls: ['./producto-modal.component.css']
})
export class ProductoModalComponent {
  @Input() open = false;                // visibilidad
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  guardando = false;
  form: FormGroup;

  // categorías visibles en el select (puedes añadir más sin romper estilos)
  categorias = [
    'Auriculares',
    'Accesorios de computadora',
    'Teclados',
    'Mouses',
    'Cables',
    'Monitores'
  ];

  constructor(private fb: FormBuilder, private api: ProductosService) {
    this.form = this.fb.group({
      sku: ['', [Validators.required, Validators.minLength(3)]],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      categoria: ['', [Validators.required]],
      minimo: [10, [Validators.required, Validators.min(0)]],
      stockMaximo: [500, [Validators.required, Validators.min(0)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      descripcion: ['']
      // stock actual NO se muestra en la maqueta; lo enviamos como 0
    });
  }

  esc(e: KeyboardEvent) {
    if (e.key === 'Escape') this.onCancel();
  }

  onCancel() {
    if (this.guardando) return;
    this.close.emit();
  }

  onSubmit() {
    if (this.guardando || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const v = this.form.value;
    const payload: ProductoCreate = {
      sku: v.sku.trim(),
      nombre: v.nombre.trim(),
      categoria: v.categoria.trim().replace(/\s+/g,' '),
      minimo: Number(v.minimo),
      stockMaximo: Number(v.stockMaximo),
      precioUnitario: Number(v.precioUnitario),
      descripcion: v.descripcion?.trim() || '',
      stock: 0 // por maqueta, creamos con stock 0 (los movimientos lo cambian)
    };

    this.api.crear(payload).subscribe({
      next: () => {
        this.guardando = false;
        // el WS /topic/productos refrescará la lista; solo cerramos y notificamos
        this.saved.emit();
        this.close.emit();
      },
      error: (err) => {
        this.guardando = false;
        // muestra errores sencillos bajo campos si aplica
        const msg = err?.error?.message || 'Error al crear producto';
        alert(msg); // no cambia estilos; puedes sustituir por toast si ya existe
      }
    });
  }
}