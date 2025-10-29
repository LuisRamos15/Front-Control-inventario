import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductosService, Producto } from '../../../inventario/services/productos.service';
import { MovimientosService, MovimientoCreate } from '../../services/movimientos.service';
import { AuthService } from '../../../../core/services/auth.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-movimiento-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './movimiento-modal.component.html',
  styleUrls: ['./movimiento-modal.component.css']
})
export class MovimientoModalComponent implements OnChanges, OnInit {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<MovimientoCreate>();

  form: FormGroup;
  buscando = false;

  resultados: Producto[] = [];
  seleccionado?: Producto;

  constructor(
    private fb: FormBuilder,
    private productos: ProductosService,
    private svc: MovimientosService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      tipo: ['SALIDA', [Validators.required]],
      productoId: ['', [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      search: [''] // solo para buscar productos por nombre/sku
    });
  }

  get soloSalida(): boolean { return this.auth.isOperator(); }

  ngOnChanges(ch: SimpleChanges): void {
    if (ch['open']?.currentValue) {
      // reset cada vez que abre
      const tipoInicial = this.soloSalida ? 'SALIDA' : 'ENTRADA';
      this.form.reset({ tipo: tipoInicial, productoId: '', cantidad: 1, search: '' });
      this.seleccionado = undefined;
      this.resultados = [];
    }
  }

  ngOnInit(): void {
    this.form.get('search')!.valueChanges.pipe(
      debounceTime(250),
      switchMap((q: string) => {
        q = (q || '').trim();
        if (!q) { this.resultados = []; return of([]); }
        this.buscando = true;
        // buscar por texto (nombre/categoria/sku)
        return this.productos.buscar(q, 10);
      })
    ).subscribe((resultados: Producto[]) => {
      this.buscando = false;
      this.resultados = resultados;
    });
  }

  seleccionar(p: Producto) {
    this.seleccionado = p;
    this.form.patchValue({ productoId: p.id, search: `${p.sku} - ${p.nombre}` });
  }

   onSubmit() {

     if (this.form.invalid) return;

     const tipo = this.form.value.tipo as 'ENTRADA'|'SALIDA';

     if (!this.auth.canCreateMovimiento(tipo)) return;

     const payload: MovimientoCreate = {

       productoId: this.form.value.productoId,

       cantidad: this.form.value.cantidad,

       tipo

     };

      this.saved.emit(payload);

      this.close.emit();

   }

  onCancel() {
    this.close.emit();
  }

  esc(e: KeyboardEvent) {
    if (e.key === 'Escape') this.onCancel();
  }
}