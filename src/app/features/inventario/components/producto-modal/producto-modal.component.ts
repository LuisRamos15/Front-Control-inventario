import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductosService, ProductoCreate, Producto } from '../../services/productos.service'; 
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-producto-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-modal.component.html',
  styleUrls: ['./producto-modal.component.css']
})
export class ProductoModalComponent implements OnChanges {
  @Input() open = false;                
  @Input() producto?: Producto;                 
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  guardando = false;
  cargando = false;
  confirmDeleteOpen = false;
  deleteTarget?: Producto;
  form: FormGroup;

  
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

  
   categorias = ['Tecnología', 'Auriculares', 'Accesorios', 'Laptops', 'Limpieza'];

   control(name: string) { return this.form.get(name)!; }

   constructor(
     private productosService: ProductosService,
     private auth: AuthService,
     private fb: FormBuilder
   ) {
    this.form = this.fb.group({
      sku: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      minimo: [{ value: 10, disabled: true }],
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
    if (ch['open'] && this.open && !this.producto) {
      
      this.resetForm();
    } else if (ch['producto'] && this.producto && this.open) {
      
      this.form.patchValue({
        sku: this.producto.sku,
        nombre: this.producto.nombre,
        categoria: this.producto.categoria,
        minimo: 10, 
        stockMaximo: this.producto.stockMaximo,
        stock: this.producto.stock ?? 0,
        precioUnitario: this.producto.precioUnitario,
        descripcion: this.producto.descripcion ?? ''
      });
      this.form.get('minimo')!.disable();
    }
  }

  resetForm(): void {
    this.form.reset({
      sku: '',
      nombre: '',
      categoria: '',
      stockMaximo: 0,
      stock: 0,
      precioUnitario: 0,
      descripcion: ''
    });
    this.form.get('minimo')!.setValue(10);
    this.form.get('minimo')!.disable();
  }



  onSubmit(): void {
    if (!this.canManageProductos) { return; }
    if (this.form.invalid) { return; }
    this.guardando = true;
    const raw = this.form.getRawValue();
    if (this.isEdit) {
      const id = this.producto!.id!;
      
      const patch: Partial<{
        nombre: string;
        categoria: string;
        descripcion: string | null;
        precioUnitario: number;
        minimo: number;
        stockMaximo: number;
      }> = {
        nombre: raw.nombre,
        categoria: raw.categoria,
        minimo: 10, 
        stockMaximo: raw.stockMaximo,
        precioUnitario: raw.precioUnitario,
        descripcion: raw.descripcion ?? null
      };
      this.productosService.actualizarProducto(id, patch).subscribe({
        next: () => { this.guardando = false; this.saved.emit(); this.close.emit(); },
        error: (e) => { this.guardando = false; console.error(e); }
      });
    } else {
      
      const payload: ProductoCreate = { ...raw, minimo: 10 }; 
      this.productosService.crearProducto(payload).subscribe({
        next: () => { this.guardando = false; this.resetForm(); this.saved.emit(); this.close.emit(); },
        error: (e) => { this.guardando = false; console.error(e); }
      });
    }
  }
}

