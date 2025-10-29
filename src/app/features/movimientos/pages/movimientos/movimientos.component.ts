import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MovimientosService, Movimiento, PageResp } from '../../services/movimientos.service';

import { AuthService } from '../../../../core/services/auth.service';

import { WebSocketService } from '../../../../core/services/websocket.service';

import { Subscription } from 'rxjs';

import { MovimientoModalComponent } from '../../components/movimiento-modal/movimiento-modal.component';

@Component({
  selector: 'app-movimientos',

  standalone: true,

  imports: [CommonModule, DatePipe, MovimientoModalComponent /* + lo que ya tuviera */],

  templateUrl: './movimientos.component.html',

  styleUrls: ['./movimientos.component.css']

})

export class MovimientosComponent implements OnInit, OnDestroy {

  tab: 'TODOS'|'ENTRADAS'|'SALIDAS' = 'TODOS';

  page = 0; size = 10; total = 0;

  cargando = false;

  data: Movimiento[] = [];

  modalOpen = false;

  private wsSub?: Subscription;

  constructor(

    private svc: MovimientosService,

    private auth: AuthService,

    private ws: WebSocketService

  ) {}

  get canOpen(): boolean { return this.auth.canOpenMovimientoModal(); }

  ngOnInit(): void {

    this.load();

    // Refrescar al recibir un movimiento por WS

    this.wsSub = this.ws.movimientos$.subscribe(() => {

      // recargar primera página del filtro actual

      this.page = 0;

      this.load();

    });

  }

  ngOnDestroy(): void {

    this.wsSub?.unsubscribe();

  }

  setTab(t: 'TODOS'|'ENTRADAS'|'SALIDAS') {

    this.tab = t;

    this.page = 0;

    this.load();

  }

  load(): void {

    this.cargando = true;

    const tipo = this.tab === 'TODOS' ? '' : (this.tab === 'ENTRADAS' ? 'ENTRADA' : 'SALIDA');

    this.svc.listar({ page: this.page, size: this.size, sort: 'fecha,desc', tipo })

    .subscribe({

      next: (resp: PageResp<Movimiento>) => {

        this.data = resp.content;

        this.total = resp.totalElements;

        this.cargando = false;

      },

      error: (e) => { console.error(e); this.cargando = false; }

    });

  }

  openModal(){ if (this.canOpen) { this.modalOpen = true; } }

  onSaved(){ this.modalOpen = false; /* WS hará refresh */ }

  onClose(){ this.modalOpen = false; }

  pageNext(){ if ((this.page + 1) * this.size < this.total) { this.page++; this.load(); } }

  pagePrev(){ if (this.page > 0) { this.page--; this.load(); } }

  // Helpers para maqueta: mapear motivo segun tipo, notas vacío

  motivoOf(m: Movimiento){ return m.tipo === 'ENTRADA' ? 'Reposición' : 'Venta'; }

  getTotalPages(): number { return Math.max(1, Math.ceil(this.total / this.size)); }

}