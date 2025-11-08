 import { Injectable, NgZone } from '@angular/core';
 import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

   import { Subject, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })

export class LiveUpdatesService {

private client!: Client;

private subs: StompSubscription[] = [];



private productosSubject = new Subject<any>();

private movimientosSubject = new Subject<any>();

private alertasSubject = new Subject<any>();

productos$(): Observable<any> { return this.productosSubject.asObservable(); }

movimientos$(): Observable<any> { return this.movimientosSubject.asObservable(); }

alertas$(): Observable<any> { return this.alertasSubject.asObservable(); }

constructor(private zone: NgZone) {}

init(): void {
if (this.client?.active) return;

const wsUrl = environment.wsBase;

 this.client = new Client({

 brokerURL: wsUrl,

 reconnectDelay: 5000,

 heartbeatIncoming: 10000,

 heartbeatOutgoing: 10000,

 debug: () => {}

 });

this.client.onConnect = () => {



this.subs.push(

this.client.subscribe('/topic/productos', (msg: IMessage) => {

this.zone.run(() => this.productosSubject.next(JSON.parse(msg.body)));

})

);



this.subs.push(

this.client.subscribe('/topic/movimientos', (msg: IMessage) => {

this.zone.run(() => this.movimientosSubject.next(JSON.parse(msg.body)));

})

);



this.subs.push(

this.client.subscribe('/topic/alertas', (msg: IMessage) => {

this.zone.run(() => this.alertasSubject.next(JSON.parse(msg.body)));

})

);

};

this.client.activate();

}



disconnect(): void {

try { this.subs.forEach(s => s.unsubscribe()); } catch {}

try { this.client.deactivate(); } catch {}

}

}

