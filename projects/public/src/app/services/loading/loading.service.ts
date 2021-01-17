import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {NavigationStart, Router} from '@angular/router';
import {filter, map, mapTo, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoadingService implements OnDestroy {
  private thingsLoading = 0;
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading$.asObservable();

  startLoading(): void {
    if (!this._loading$.value) this._loading$.next(true);
    this.thingsLoading++;
  }

  stopLoading(): void {
    if (this.thingsLoading > 0) this.thingsLoading--;
    if (this.thingsLoading === 0 && this._loading$.value) {
      this._loading$.next(false);
    }
  }

  loading(): boolean {
    return this._loading$.value;
  }

  waitTillLoaded(): Promise<void> {
    return this.waitTillLoaded$().toPromise();
  }

  waitTillLoaded$(): Observable<void> {
    return this.loading$.pipe(
      filter(loading => !loading),
      take(1),
      mapTo(undefined)
    );
  }

  constructor(
    private readonly router: Router
  ) {
    this.subscriptions.push(this.watchRouterEvents$().subscribe());
  }

  private watchRouterEvents$(): Observable<void> {
    return this.router.events.pipe(
      map(event => {
        if (event instanceof NavigationStart) this.startLoading();
        else this.stopLoading();
      })
    );
  }

  private readonly subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }
}
