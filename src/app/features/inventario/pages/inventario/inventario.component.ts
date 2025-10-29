import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

import { ProductosService, Producto } from '../../services/productos.service';

import { WebSocketService } from '../../../../core/services/websocket.service';

import { AuthService } from '../../../../core/services/auth.service';

import { ProductoModalComponent } from '../../components/producto-modal/producto-modal.component';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

type Estado = 'CRITICO' | 'BAJO' | 'NORMAL' | 'ALTO';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductoModalComponent, ConfirmModalComponent],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  // UI
  buscando = '';
  cargando = false;
  modalOpen = false;
  confirmDeleteOpen = false;
  deleteTarget?: Producto;

  // datos
  productos: (Producto & { estado?: Estado })[] = [];
  filtrados: (Producto & { estado?: Estado })[] = [];
  editTarget?: Producto;

  constructor(
    private productosService: ProductosService,
    private ws: WebSocketService,
    private auth: AuthService
  ) {}

  get canManageProductos(): boolean {
    return this.auth.canManageProductos();
  }

  ngOnInit(): void {
    this.cargar();
    // Tiempo real: si hay cambios en productos -> recargar
    this.ws.productos$
      .pipe(debounceTime(200))
      .subscribe(() => this.cargar());
  }

  /** Carga del backend: lista completa o búsqueda paginada (Page->content) */
  cargar(): void {
    this.cargando = true;
    const q = (this.buscando || '').trim();
    const src$ = q ? this.productosService.buscar(q) : this.productosService.listarTodos();
    src$.subscribe({
      next: (list) => {
        const arr = Array.isArray(list) ? list : [];
        this.productos = arr.map(p => ({ ...p, estado: this.calcularEstado(p) }));
        this.filtrados = [...this.productos];
        this.cargando = false;
      },
      error: () => {
        this.productos = this.filtrados = [];
        this.cargando = false;
      }
    });
  }

  /** Cambio en caja de búsqueda (buscar remoto). No toca HTML/CSS. */
  onBuscarChange(): void {
    this.cargar();
  }

  /** Derivar estado visual desde stock/minimo/stockMaximo */
  private calcularEstado(p: Producto): Estado {
    const stock = p.stock ?? 0;
    const min   = p.minimo ?? 0;
    const stockMaximo   = p.stockMaximo ?? 0;
    if (min > 0 && stock <= Math.max(1, Math.floor(min / 2))) return 'CRITICO';
    if (min > 0 && stock <= min) return 'BAJO';
    if (stockMaximo > 0 && stock >= stockMaximo) return 'ALTO';
    return 'NORMAL';
  }

  // Botones (solo visual por ahora; no se toca navegación)
  crearProducto(): void { this.editTarget = undefined; this.modalOpen = true; }
  editar(p: Producto): void {
if (!this.canManageProductos) { return; }
this.editTarget = p;
this.modalOpen = true;
}
  eliminar(p: Producto): void {
    if (!this.canManageProductos) { return; }
    this.deleteTarget = p;
    this.confirmDeleteOpen = true;
  }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.cargando = true;
    this.productosService.eliminarProducto(this.deleteTarget.id!)
      .subscribe({
        next: () => {
          this.cargando = false;
          this.closeConfirmDelete();
          /* la lista se actualiza por WS */
        },
        error: (e) => {
          this.cargando = false;
          console.error(e);
          this.closeConfirmDelete();
        }
      });
  }

  closeConfirmDelete(): void {
    this.confirmDeleteOpen = false;
    this.deleteTarget = undefined;
  }

  onModalClosed() { this.modalOpen = false; this.editTarget = undefined; }



  trackById(index: number, p: any) {
    return p?.id ?? p?.sku ?? index;
  }

  onModalSaved()  { this.editTarget = undefined; /* WS actualiza */ }
}