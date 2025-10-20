import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
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
export class ProductoModalComponent implements OnChanges {
  @Input() open = false;                // visibilidad
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  guardando = false;
  form: FormGroup;

  // Valores por defecto para reapertura limpia
  private readonly defaults = {
    sku: '',
    nombre: '',
    categoria: '',
    minimo: 10,
    stockMaximo: 500,
    precioUnitario: 0,
    descripcion: ''
  };

  // Sugerencias (sin cambio)
  categorias = ['Auriculares','Accesorios de computadora','Teclados','Mouses','Cables','Monitores'];

  constructor(private fb: FormBuilder, private api: ProductosService) {
    this.form = this.fb.group({
      sku: [this.defaults.sku, [Validators.required, Validators.minLength(3)]],
      nombre: [this.defaults.nombre, [Validators.required, Validators.minLength(3)]],
      categoria: [this.defaults.categoria, [Validators.required]],
      minimo: [this.defaults.minimo, [Validators.required, Validators.min(0)]],
      stockMaximo: [this.defaults.stockMaximo, [Validators.required, Validators.min(0)]],
      precioUnitario: [this.defaults.precioUnitario, [Validators.required, Validators.min(0)]],
      descripcion: [this.defaults.descripcion]
    });
  }

  esc(e: KeyboardEvent) {
    if (e.key === 'Escape') this.onCancel();
  }

  onCancel(): void {
    if (this.guardando) return;
    this.resetForm();            //  limpia siempre
    this.close.emit();           //  cierra modal en el padre
  }

  //  Cada vez que el modal se abre, arrancar limpio
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === true) {
      this.resetForm();
    }
  }

  //  Reset centralizado (valores por defecto + pristine/untouched)
  private resetForm(): void {
    this.form.reset(this.defaults);
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  onSubmit(): void {
    if (this.guardando || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const v = this.form.value;
    const payload: ProductoCreate = {
      sku: (v.sku ?? '').trim(),
      nombre: (v.nombre ?? '').trim(),
      categoria: (v.categoria ?? '').trim().replace(/\s+/g, ' '),
      minimo: Number(v.minimo ?? 0),
      stockMaximo: Number(v.stockMaximo ?? 0),
      precioUnitario: Number(v.precioUnitario ?? 0),
      descripcion: (v.descripcion ?? '').trim(),
      stock: 0
    };

    this.api.crear(payload).subscribe({
      next: () => {
        this.guardando = false;
        this.resetForm();        //  deja listo para próxima apertura
        this.saved.emit();       // (opcional) notifica éxito
        this.close.emit();       // cierra; la lista se actualiza por WS
      },
      error: () => {
        this.guardando = false;
        // mantener el formulario para correcciones del usuario
      }
    });
  }
}