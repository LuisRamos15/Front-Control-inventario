import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AlertsService } from '../../core/realtime/alerts.service';
import { AuthService } from '../../core/auth/auth.service';
import { Alerta } from './alert.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-alert-center',
  templateUrl: './alert-center.component.html',
  styleUrls: ['./alert-center.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AlertCenterComponent {
  isAdminOrSupervisor: boolean;

  
  tab = signal<'TODAS'|'ACTIVAS'|'CRITICAS'|'RESUELTAS'>('TODAS');

  
  alerts$: Observable<Alerta[]>;

  
  countTodas$: Observable<number>;
  countActivas$: Observable<number>;
  countCriticas$: Observable<number>;
  countResueltas$: Observable<number>;

  constructor(private alerts: AlertsService, private auth: AuthService) {
    this.isAdminOrSupervisor = this.auth.isAdminOrSupervisor();
    this.alerts$ = this.alerts.list$;
    this.countTodas$ = this.alerts$.pipe(map(l => l.length));
    this.countActivas$ = this.alerts$.pipe(map(l => l.filter(a => a.status !== 'RESUELTA').length));
    this.countCriticas$ = this.alerts$.pipe(map(l => l.filter(a => a.nivel === 'CRITICA' && a.status !== 'RESUELTA').length));
    this.countResueltas$ = this.alerts$.pipe(map(l => l.filter(a => a.status === 'RESUELTA').length));
  }

  alertsFiltradas(list: Alerta[]): Alerta[] {
    switch (this.tab()) {
      case 'ACTIVAS':   return list.filter(a => a.status !== 'RESUELTA');
      case 'CRITICAS':  return list.filter(a => a.nivel === 'CRITICA' && a.status !== 'RESUELTA');
      case 'RESUELTAS': return list.filter(a => a.status === 'RESUELTA');
      default:          return list;
    }
  }

  reconocer(a: Alerta) {
    if (!this.isAdminOrSupervisor || a.status === 'RESUELTA') return;
    this.alerts.setStatus(a.id, 'RECONOCIDA');
  }

  resolver(a: Alerta) {
    if (!this.isAdminOrSupervisor || a.status === 'RESUELTA') return;
    this.alerts.setStatus(a.id, 'RESUELTA');
  }
}

