import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertsService } from './core/realtime/alerts.service';
import { ToastContainerComponent } from './shared/ui/toast/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  constructor(private alerts: AlertsService) {}

  ngOnInit(): void {
    this.alerts.initWsListener();
  }
}

