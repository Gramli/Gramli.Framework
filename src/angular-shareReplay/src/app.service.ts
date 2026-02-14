import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Vehicle } from './app.model';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  pipe,
  retry,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private vehiclesDataCache: Vehicle[] | null = null;

  private vehiclesDataShareReplay$: Observable<Vehicle[]> | null = null;
  private vehiclesDataBehavior$: Observable<Vehicle[]> | null = null;
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(private http: HttpClient) {}

  public getVehiclesData(): Observable<Vehicle[]> {
    if (this.vehiclesDataCache) {
      return of(this.vehiclesDataCache);
    }

    const observable = this.http.get<Vehicle[]>(
      'https://starwars-databank-server.vercel.app/api/v1/vehicles',
    );
    observable.subscribe((response: any) => {
      this.vehiclesDataCache = response.data;
    });
    return observable;
  }

  public getVehicleShareReplay(): Observable<Vehicle[]> {
    if (!this.vehiclesDataShareReplay$) {
      this.vehiclesDataShareReplay$ = this.http
        .get<Vehicle[]>('https://starwars-databank-server.vercel.app/api/v1/vehicles')
        .pipe(
          map((response: any) => response.data),
          retry(2),
          catchError((error) => {
            this.vehiclesDataShareReplay$ = null;
            return throwError(() => error);
          }),
          shareReplay(1),
        );
    }
    return this.vehiclesDataShareReplay$;
  }

  public getVehicleBehavior(): Observable<Vehicle[]> {
    if (!this.vehiclesDataBehavior$) {
      this.vehiclesDataBehavior$ = this.refreshTrigger$.pipe(
        switchMap(() =>
          this.http
            .get<Vehicle[]>('https://starwars-databank-server.vercel.app/api/v1/vehicles')
            .pipe(
              map((response: any) => response.data),
              retry(2),
              catchError((error) => {
                console.error('Error fetching vehicles:', error);
                return of([]); // Return empty array to keep stream alive
              }),
            ),
        ),
        shareReplay(1),
      );
    }
    return this.vehiclesDataBehavior$;
  }

  public refreshVehiclesBehavior(): void {
    this.refreshTrigger$.next(undefined);
  }
}
