import { Component, signal, effect, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../app.model';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('angular-shareReplay');
  protected vehicles = signal<Vehicle[]>([]);
  protected loading = signal(false);
  protected activeMethod = signal<string>('none');

  constructor(private appService: AppService) {}

  ngOnInit(): void {}

  loadVehicles(): void {
    this.activeMethod.set('basic');
    this.loading.set(true);
    this.appService.getVehiclesData().subscribe({
      next: (response) => {
        this.vehicles.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.loading.set(false);
      }
    });
  }

  loadVehiclesShareReplay(): void {
    this.activeMethod.set('shareReplay');
    this.loading.set(true);
    this.appService.getVehicleShareReplay().subscribe({
      next: (response) => {
        this.vehicles.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.loading.set(false);
      }
    });
  }

  loadVehiclesBehavior(): void {
    this.activeMethod.set('behavior');
    this.loading.set(true);
    this.appService.getVehicleBehavior().subscribe({
      next: (response) => {
        this.vehicles.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.loading.set(false);
      }
    });
  }

  refreshBehavior(): void {
    this.loading.set(true);
    this.appService.refreshVehiclesBehavior();
    setTimeout(() => this.loading.set(false), 500);
  }
}