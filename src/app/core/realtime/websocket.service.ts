import { Injectable } from '@angular/core';
import { Client, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Injectable({
  providedIn: 'root'
})


export class WebSocketService {
  private client: Client;
  private alertasSubject = new Subject<any>();
  private movimientosSubject = new Subject<any>();
  private productosSubject = new Subject<any>();

  private alertasSubscribed = false;

  public alertas$ = this.alertasSubject.asObservable();
  public movimientos$ = this.movimientosSubject.asObservable();
  public productos$ = this.productosSubject.asObservable();

  constructor(private auth: AuthService, private toast: ToastService) {
    this.client = new Client({
      webSocketFactory: () => new SockJS(environment.wsUrl),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Connected: ' + frame);

      if (!this.alertasSubscribed) {
        this.alertasSubscribed = true;
        this.client.subscribe('/topic/alertas', (message) => {
          const payload = JSON.parse(message.body);
          this.alertasSubject.next(payload);

  
          if (this.auth.hasRole('ADMIN')) {
            const nombre = payload?.productoNombre || 'Producto';
            const sku = payload?.sku ? ` (${payload.sku})` : '';
            const stock = payload?.stock ?? '-';
            const minimo = payload?.minimo ?? '-';
            this.toast.warning(
              `Stock bajo para ${nombre}${sku}. Stock: ${stock}, Mínimo: ${minimo}`,
              'Stock bajo'
            );
          }
        });
      }

      this.client.subscribe('/topic/movimientos', (message) => {
        this.movimientosSubject.next(JSON.parse(message.body));
      });

      this.client.subscribe('/topic/productos', (message) => {
        this.productosSubject.next(JSON.parse(message.body));
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.activate();
  }

  connect() {
    console.log("Conectando al servidor...");
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }
}

