import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertsService } from './core/services/alerts.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  constructor(private alerts: AlertsService) {}

  ngOnInit(): void {
    this.alerts.initWsListener();
  }
}