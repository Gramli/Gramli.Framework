import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VehiclesApiResponse, Vehicle } from './app.model';
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  Observable,
  of,
  retry,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private vehiclesDataCache: VehiclesApiResponse | null = null;

  private vehiclesDataShareReplay$: Observable<VehiclesApiResponse> | null = null;
  private vehiclesDataBehavior$: Observable<VehiclesApiResponse> | null = null;
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(private http: HttpClient) {}

  public getVehiclesData(): Observable<VehiclesApiResponse> {
    if (this.vehiclesDataCache) {
      return of(this.vehiclesDataCache);
    }

    const observable = this.http.get<VehiclesApiResponse>(
      'https://starwars-databank-server.vercel.app/api/v1/vehicles',
    );
    observable.subscribe((response: VehiclesApiResponse) => {
      this.vehiclesDataCache = response;
    });
    return observable;
  }

  public getVehicleShareReplay(): Observable<VehiclesApiResponse> {
    if (!this.vehiclesDataShareReplay$) {
      this.vehiclesDataShareReplay$ = this.http
        .get<VehiclesApiResponse>('https://starwars-databank-server.vercel.app/api/v1/vehicles')
        .pipe(
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

  public getVehicleBehavior(): Observable<VehiclesApiResponse> {
    if (!this.vehiclesDataBehavior$) {
      this.vehiclesDataBehavior$ = this.refreshTrigger$.pipe(
        switchMap(() =>
          this.http
            .get<VehiclesApiResponse>('https://starwars-databank-server.vercel.app/api/v1/vehicles')
            .pipe(
              retry(2),
              catchError((error) => {
                console.error('Error fetching vehicles:', error);
                return EMPTY;
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
