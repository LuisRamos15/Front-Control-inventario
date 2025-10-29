import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductosService, ProductoCreate, Producto } from '../../services/productos.service'; // Asegurar import de Producto
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-producto-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-modal.component.html',
  styleUrls: ['./producto-modal.component.css']
})
export class ProductoModalComponent implements OnChanges {
  @Input() open = false;                // visibilidad
  @Input() producto?: Producto;                 // <-- NUEVO: producto en edición
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  guardando = false;
  cargando = false;
  confirmDeleteOpen = false;
  deleteTarget?: Producto;
  form: FormGroup;

  // Valores por defecto para reapertura limpia
  private readonly defaults = {
    sku: '',
    nombre: '',
    categoria: '',
    minimo: 10,
    stock: 0,
    stockMaximo: 500,
    precioUnitario: 0,
    descripcion: ''
  };

  // Sugerencias
  sugerencias = ['Tecnología', 'Auriculares', 'Accesorios', 'Laptops', 'Limpieza'];

  constructor(
    private productosService: ProductosService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      sku: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      minimo: [0, [Validators.required, Validators.min(0)]],
      stockMaximo: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      descripcion: ['']
    });
  }

  get canManageProductos(): boolean {
    return this.auth.canManageProductos();
  }

  get isEdit(): boolean { return !!this.producto?.id; }

  esc(e: KeyboardEvent) {
    if (e.key === 'Escape') this.onCancel();
  }

  onCancel() { this.close.emit(); }

  ngOnChanges(ch: SimpleChanges): void {
    if (ch['producto'] && this.producto && this.open) {
      // Pre-carga al abrir en edición (SKU queda solo lectura en HTML)
      this.form.patchValue({
        sku: this.producto.sku,
        nombre: this.producto.nombre,
        categoria: this.producto.categoria,
        minimo: this.producto.minimo,
        stockMaximo: this.producto.stockMaximo,
        stock: this.producto.stock ?? 0,
        precioUnitario: this.producto.precioUnitario,
        descripcion: this.producto.descripcion ?? ''
      });
    }
  }

  resetForm(): void {
    this.form.reset({
      sku: '',
      nombre: '',
      categoria: '',
      minimo: 0,
      stockMaximo: 0,
      stock: 0,
      precioUnitario: 0,
      descripcion: ''
    });
  }



  onSubmit(): void {
    if (!this.canManageProductos) { return; }
    if (this.form.invalid) { return; }
    this.guardando = true;
    if (this.isEdit) {
      const id = this.producto!.id!;
      // PATCH parcial (sin sku ni stock)
      const patch: Partial<{
        nombre: string;
        categoria: string;
        descripcion: string | null;
        precioUnitario: number;
        minimo: number;
        stockMaximo: number;
      }> = {
        nombre: this.form.value.nombre,
        categoria: this.form.value.categoria,
        minimo: this.form.value.minimo,
        stockMaximo: this.form.value.stockMaximo,
        precioUnitario: this.form.value.precioUnitario,
        descripcion: this.form.value.descripcion ?? null
      };
      this.productosService.actualizarProducto(id, patch).subscribe({
        next: () => { this.guardando = false; this.saved.emit(); this.close.emit(); },
        error: (e) => { this.guardando = false; console.error(e); }
      });
    } else {
      // Crear (como estaba)
      const payload: ProductoCreate = this.form.value;
      this.productosService.crearProducto(payload).subscribe({
        next: () => { this.guardando = false; this.resetForm(); this.saved.emit(); this.close.emit(); },
        error: (e) => { this.guardando = false; console.error(e); }
      });
    }
  }
}