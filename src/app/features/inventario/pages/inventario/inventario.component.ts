import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime } from 'rxjs/operators';

import { ProductosService, Producto } from '../../services/productos.service';

import { WebsocketService } from '../../../../core/services/websocket.service';

import { ProductoModalComponent } from '../../components/producto-modal/producto-modal.component';

import { Subscription } from 'rxjs';

type Estado = 'CRITICO' | 'BAJO' | 'NORMAL' | 'ALTO';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit, OnDestroy {
  // UI
  buscando = '';
  cargando = false;

  // datos
  productos: (Producto & { estado?: Estado })[] = [];
  filtrados: (Producto & { estado?: Estado })[] = [];

  private wsSub?: Subscription;

  constructor(
    private productosService: ProductosService,
    private ws: WebsocketService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.ws.init(); // activa conexión STOMP una sola vez
    // Cuando llegue un evento del tópico, vuelve a cargar la lista
    this.wsSub = this.ws.productos$.subscribe((_evt: any) => {
      this.cargarProductos();  // usa tu método existente de carga
    });
    this.cargarProductos();
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    // NO llames ws.disconnect() si hay más pantallas que lo usan
  }

  /** Carga del backend: lista completa o búsqueda paginada (Page->content) */
  private cargarProductos(): void {
    this.cargando = true;
    const q = (this.buscando || '').trim();
    const src$ = q ? this.productosService.buscar(q) : this.productosService.listarTodos();
    src$.subscribe({
      next: (list: any) => {
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
    this.cargarProductos();
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
  crearProducto(): void {
    this.dialog.open(ProductoModalComponent, {
      width: '860px',              // ancho cómodo (maqueta-like)
      maxWidth: '96vw',            // responsivo
      height: 'auto',              // alto automático para contenido completo
      maxHeight: '80vh',           // limita altura en pantallas grandes
      panelClass: 'producto-modal-panel',
      autoFocus: false,            // evita scroll inicial por autofocus
      restoreFocus: true,
    });
  }
  editar(p: Producto): void {/* future nav */}
  eliminar(p: Producto): void {/* future action */}

  trackById(index: number, p: any) {
    return p?.id ?? p?.sku ?? index;
  }
}