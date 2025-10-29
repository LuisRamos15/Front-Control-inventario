import { Injectable, NgZone } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { Subject, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })

export class LiveUpdatesService {

private client!: Client;

private subs: StompSubscription[] = [];

// Canales que usaremos en la app

private productosSubject = new Subject<any>();

private movimientosSubject = new Subject<any>();

private alertasSubject = new Subject<any>();

productos$(): Observable<any> { return this.productosSubject.asObservable(); }

movimientos$(): Observable<any> { return this.movimientosSubject.asObservable(); }

alertas$(): Observable<any> { return this.alertasSubject.asObservable(); }

constructor(private zone: NgZone) {}

init(): void {
if (this.client?.active) return;

const wsUrl = environment.wsUrl;

this.client = new Client({

webSocketFactory: () => new SockJS(wsUrl),

reconnectDelay: 5000,           // reconecta solo

heartbeatIncoming: 10000,

heartbeatOutgoing: 10000,

debug: () => {}                 // sin logs en consola

});

this.client.onConnect = () => {

// Productos

this.subs.push(

this.client.subscribe('/topic/productos', (msg: IMessage) => {

this.zone.run(() => this.productosSubject.next(JSON.parse(msg.body)));

})

);

// Movimientos (ajusta el tópico si en backend usas otro, p.e. '/topic/movimientos')

this.subs.push(

this.client.subscribe('/topic/movimientos', (msg: IMessage) => {

this.zone.run(() => this.movimientosSubject.next(JSON.parse(msg.body)));

})

);

// Alertas

this.subs.push(

this.client.subscribe('/topic/alertas', (msg: IMessage) => {

this.zone.run(() => this.alertasSubject.next(JSON.parse(msg.body)));

})

);

};

this.client.activate();

}

// No llames a disconnect() salvo al cerrar la app

disconnect(): void {

try { this.subs.forEach(s => s.unsubscribe()); } catch {}

try { this.client.deactivate(); } catch {}

}

}