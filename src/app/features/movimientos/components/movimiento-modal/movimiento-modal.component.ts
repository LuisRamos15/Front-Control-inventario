import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProductosService, Producto } from '../../../inventario/services/productos.service';
import { MovimientosService, MovimientoCreate } from '../../services/movimientos.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AlertModalService } from '../ui/alert-modal/alert-modal.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-movimiento-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
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
     private auth: AuthService,
     private alert: AlertModalService
   ) {
    this.form = this.fb.group({
      tipo: ['SALIDA', [Validators.required]],
      productoId: ['', [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      search: [''] 
    });
  }

  get soloSalida(): boolean { return this.auth.isOperator(); }

  ngOnChanges(ch: SimpleChanges): void {
    if (ch['open']?.currentValue) {
      
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

        
        if (tipo === 'SALIDA' && this.seleccionado && this.seleccionado.stock !== undefined) {
          if (this.form.value.cantidad > this.seleccionado.stock) {
            this.alert.open({
              title: 'Advertencia de stock',
              message: `No se puede realizar la salida. Cantidad (${this.form.value.cantidad}) supera el stock actual (${this.seleccionado.stock}).`,
              autoCloseMs: 4500
            });
            return;
          }
        } else if (tipo === 'ENTRADA' && this.seleccionado && this.seleccionado.stock !== undefined && this.seleccionado.stockMaximo !== null && this.seleccionado.stockMaximo !== undefined) {
          const stockResultante = this.seleccionado.stock + this.form.value.cantidad;
          if (stockResultante > this.seleccionado.stockMaximo) {
            this.alert.open({
              title: 'Advertencia de stock',
              message: `No se puede realizar la entrada. El stock resultante (${stockResultante}) supera el máximo (${this.seleccionado.stockMaximo}).`,
              autoCloseMs: 4500
            });
            return;
          }
        }

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

