import { Injectable, NgZone } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private client!: Client;
  private subs: StompSubscription[] = [];
  private productosSubject = new Subject<any>();
  private alertasSubject = new Subject<any>();
  private movimientosSubject = new Subject<any>();

  productos$: Observable<any> = this.productosSubject.asObservable();
  alertas$: Observable<any> = this.alertasSubject.asObservable();
  movimientos$: Observable<any> = this.movimientosSubject.asObservable();

  constructor(private zone: NgZone) {
    this.init();
  }

  init(): void {
    if (this.client?.active) return;

    // Usa SIEMPRE la URL del backend desde environment (no harcodear localhost)
    const wsUrl = `${environment.apiUrl}/ws`;  // ej: http://api.midominio.com/ws

    this.client = new Client({
      // SockJS para funcionar detrás de proxies y en equipos que no acepten upgrade WS
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,               // reconectar auto
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {}                     // silenciamos logs
    });

    this.client.onConnect = () => {
      // Suscripción a tópicos
      this.subs.push(
        this.client.subscribe('/topic/productos', (msg: IMessage) => {
          this.zone.run(() => {
            const payload = JSON.parse(msg.body);
            this.productosSubject.next(payload);
          });
        })
      );
      this.subs.push(
        this.client.subscribe('/topic/alertas', (msg: IMessage) => {
          this.zone.run(() => {
            const payload = JSON.parse(msg.body);
            this.alertasSubject.next(payload);
          });
        })
      );
      this.subs.push(
        this.client.subscribe('/topic/movimientos', (msg: IMessage) => {
          this.zone.run(() => {
            const payload = JSON.parse(msg.body);
            this.movimientosSubject.next(payload);
          });
        })
      );
    };

    this.client.onStompError = () => {};   // opcional: log/telemetría
    this.client.onWebSocketClose = () => {}; // opcional

    this.client.activate();
  }

  disconnect(): void {
    try { this.subs.forEach(s => s.unsubscribe()); } catch {}
    try { this.client.deactivate(); } catch {}
  }
}