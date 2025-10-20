import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

import { ProductosService, Producto } from '../../services/productos.service';

import { WebSocketService } from '../../../../core/services/websocket.service';

type Estado = 'CRITICO' | 'BAJO' | 'NORMAL' | 'ALTO';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  // UI
  buscando = '';
  cargando = false;

  // datos
  productos: (Producto & { estado?: Estado })[] = [];
  filtrados: (Producto & { estado?: Estado })[] = [];

  constructor(
    private api: ProductosService,
    private ws: WebSocketService
  ) {}

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
    const src$ = q ? this.api.buscar(q) : this.api.listarTodos();
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

  /** Derivar estado visual desde stock/minimo/maximo */
  private calcularEstado(p: Producto): Estado {
    const stock = p.stock ?? 0;
    const min   = p.minimo ?? 0;
    const max   = p.maximo ?? 0;
    if (min > 0 && stock <= Math.max(1, Math.floor(min / 2))) return 'CRITICO';
    if (min > 0 && stock <= min) return 'BAJO';
    if (max > 0 && stock >= max) return 'ALTO';
    return 'NORMAL';
  }

  // Botones (solo visual por ahora; no se toca navegación)
  crearProducto(): void {/* future nav */}
  editar(p: Producto): void {/* future nav */}
  eliminar(p: Producto): void {/* future action */}
}