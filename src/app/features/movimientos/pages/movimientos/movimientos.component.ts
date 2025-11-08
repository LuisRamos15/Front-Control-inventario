import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MovimientosService, Movimiento, PageResp } from '../../services/movimientos.service';

import { AuthService } from '../../../../core/auth/auth.service';

import { WebSocketService } from '../../../../core/realtime/websocket.service';

import { Subscription } from 'rxjs';

import { MovimientoModalComponent } from '../../components/movimiento-modal/movimiento-modal.component';

type TipoMovimiento = 'ENTRADA' | 'SALIDA';

@Component({
  selector: 'app-movimientos',

  standalone: true,

  imports: [CommonModule, DatePipe, MovimientoModalComponent, MatTableModule, MatPaginatorModule ],

  templateUrl: './movimientos.component.html',

  styleUrls: ['./movimientos.component.css']

})

export class MovimientosComponent implements OnInit, OnDestroy {

  activeTab: 'TODOS' | 'ENTRADA' | 'SALIDA' = 'TODOS';

  // estado de paginación (SIEMPRE controlado por backend)

  pageIndex = 0;        // 0-based

  pageSize  = 5;

  total     = 0;

  // opciones visibles (agregamos 'Todo' con -1 como centinela)

  pageSizeOpts = [5, 10, 20];

  mostrarTodo = false;  // true => traer todos

  // datos

  filas: Movimiento[] = [];

  displayedColumns: string[] = ['fecha', 'tipo', 'producto', 'cantidad', 'usuario', 'motivo', 'notas'];

  cargando = false;

  modalOpen = false;

  showNuevoModal = false;

  private wsSub?: Subscription;

  constructor(

    private svc: MovimientosService,

    private auth: AuthService,

    private ws: WebSocketService

  ) {}

  get canOpen(): boolean { return this.auth.canOpenMovimientoModal(); }

  ngOnInit(): void {

    this.cargarPagina();

    this.wsSub = this.ws.movimientos$.subscribe(() => {
      this.cargarPagina();
    });

  }

  ngOnDestroy(): void {

    this.wsSub?.unsubscribe();

  }

  seleccionarTab(tab: 'TODOS' | 'ENTRADA' | 'SALIDA') {

    if (this.activeTab === tab) return;

    this.activeTab = tab;

    this.pageIndex = 0;

    this.cargarPagina();

  }

  // evento del paginator (siguiente/anterior o cambio de size 5/10/20)

  onPage(ev: PageEvent) {

    this.mostrarTodo = false;   // al cambiar aquí, quitamos 'Todo'

    this.pageIndex = ev.pageIndex;

    this.pageSize  = ev.pageSize;

    this.cargarPagina();

  }

  // click en 'Todo'

  verTodo() {

    this.mostrarTodo = true;

    this.pageIndex = 0;

    // estrategia robusta: 1) pedir total, 2) pedir todo

    this.svc.listarPaginado({

      page: 0,

      size: 1,

      tipo: this.activeTab === 'TODOS' ? undefined : this.activeTab,

      sort: 'fecha,desc'

    }).subscribe(resp1 => {

      const total = resp1?.totalElements ?? 0;

      this.pageSize = total || 1; // evita 0

      this.cargarPagina();

    });

  }

  private cargarPagina() {

    const tipo = this.activeTab === 'TODOS' ? undefined : this.activeTab;

    this.svc.listarPaginado({

      page: this.pageIndex,

      size: this.pageSize,

      tipo,

      sort: 'fecha,desc'

    }).subscribe((resp: PageResp<Movimiento>) => {

      this.filas     = resp?.content ?? [];

      this.total     = resp?.totalElements ?? 0;

      this.pageIndex = resp?.number ?? this.pageIndex;

      this.pageSize  = this.mostrarTodo ? (resp?.totalElements ?? this.pageSize)

        : (resp?.size ?? this.pageSize);

    });

  }

  openNuevoMovimiento(){ if (this.canOpen) { this.showNuevoModal = true; } }

  closeNuevoMovimiento(){ this.showNuevoModal = false; }

  onMovimientoGuardado(payload: any) {

    const req = {

      productoId: payload.productoId,

      tipo: payload.tipo,

      cantidad: payload.cantidad

    };

      this.svc.registrar(req).subscribe({

       next: () => {

         this.closeNuevoMovimiento();

         this.cargarPagina();

       },

       error: (e) => console.error(e)

     });

  }

  motivoOf(m: Movimiento){ return m.tipo === 'ENTRADA' ? 'Reposición' : 'Venta'; }

}

