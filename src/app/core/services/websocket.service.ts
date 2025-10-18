import { Injectable } from '@angular/core';
import { Client, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client;
  private alertasSubject = new Subject<any>();
  private movimientosSubject = new Subject<any>();

  public alertas$ = this.alertasSubject.asObservable();
  public movimientos$ = this.movimientosSubject.asObservable();

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(environment.wsUrl),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Connected: ' + frame);

      this.client.subscribe('/topic/alertas', (message) => {
        this.alertasSubject.next(JSON.parse(message.body));
      });

      this.client.subscribe('/topic/movimientos', (message) => {
        this.movimientosSubject.next(JSON.parse(message.body));
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }
}