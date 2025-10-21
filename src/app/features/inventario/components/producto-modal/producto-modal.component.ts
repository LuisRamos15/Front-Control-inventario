import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ProductosService, ProductoCreate } from '../../services/productos.service';

@Component({
  selector: 'app-producto-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-modal.component.html',
  styleUrls: ['./producto-modal.component.css']
})
export class ProductoModalComponent implements OnInit {
  guardando = false;
  form: FormGroup;

  // Valores por defecto para reapertura limpia
  private readonly defaults = {
    sku: '',
    nombre: '',
    categoria: '',
    stock: 0,
    stockMaximo: 500,
    precioUnitario: 0,
    descripcion: ''
  };

  // Sugerencias
  sugerencias = ['Tecnología', 'Auriculares', 'Accesorios', 'Laptops', 'Limpieza'];

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private dialogRef: MatDialogRef<ProductoModalComponent>
  ) {
    this.form = this.fb.nonNullable.group({
      sku: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      categoria: [''],
      stockMaximo: [500, [Validators.required, Validators.min(10)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    this.resetForm();
  }

  esc(e: KeyboardEvent) {
    if (e.key === 'Escape') this.onCancel();
  }

  onCancel(): void {
    if (this.guardando) return;
    this.resetForm();            //  limpia siempre
    this.dialogRef.close();      //  cierra modal
  }

  onClose(): void {
    this.onCancel();
  }

  //  Reset centralizado (valores por defecto + pristine/untouched)
  private resetForm(): void {
    this.form.reset({
      sku: '',
      nombre: '',
      categoria: '',
      stockMaximo: 500,
      stock: 0,
      precioUnitario: 0,
      descripcion: ''
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  onSubmit(): void {
    if (this.guardando || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const v = this.form.getRawValue();
    const payload: ProductoCreate = {
      sku: (v.sku ?? '').trim(),
      nombre: (v.nombre ?? '').trim(),
      categoria: v.categoria?.trim() ?? '',
      stock: Number(v.stock ?? 0),
      stockMaximo: Number(v.stockMaximo ?? 0),
      precioUnitario: Number(v.precioUnitario ?? 0),
      descripcion: (v.descripcion ?? '').trim() || null
    };

    this.productosService.crearProducto(payload).subscribe({
      next: () => {
        this.guardando = false;
        this.resetForm();        //  deja listo para próxima apertura
        this.dialogRef.close();  // cierra; la lista se actualiza por WS
      },
      error: (e) => {
        this.guardando = false;
        console.error(e);
        // mantener el formulario para correcciones del usuario
      }
    });
  }
}