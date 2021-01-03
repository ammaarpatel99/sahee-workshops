import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, ReplaySubject, Subscription} from 'rxjs';
import {filter, map, switchMap, switchMapTo, take, takeWhile, tap} from 'rxjs/operators';
import {ActivatedRoute, Data, ParamMap, Router} from '@angular/router';
import {AdminWorkshop} from '../../../../../../../firestore-interfaces/workshops/workshop';
import {AdminWorkshopsService} from '../../../services/admin-workshops/admin-workshops.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
  selector: 'app-admin-workshop',
  templateUrl: './admin-workshop.component.html',
  styleUrls: ['./admin-workshop.component.scss']
})
export class AdminWorkshopComponent implements OnInit, OnDestroy {
  private readonly _workshop$ = new ReplaySubject<AdminWorkshop | undefined>(1);
  readonly workshop$ = this._workshop$.asObservable();
  innerContainerClass: 'inner-container' | 'wide-inner-container' = 'inner-container';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminWorkshopsService: AdminWorkshopsService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.subscriptions.push(this.setup$().subscribe());
    this.subscriptions.push(this.watchBreakpointsForContainerWidth$().subscribe());
  }

  ngOnInit(): void {
  }

  private watchBreakpointsForContainerWidth$(): Observable<void> {
    return this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.TabletPortrait]).pipe(
      map(state => state.matches),
      tap(matches => {
        this.innerContainerClass = matches ? 'wide-inner-container' : 'inner-container';
      }),
      map(_ => {
      })
    );
  }

  private setup$(): Observable<void> {
    return this.route.data.pipe(
      tap(async (data: Data): Promise<void> => {
        if (data.new) {
          this._workshop$.next(undefined);
        }
      }),
      filter((data: Data): boolean => !data.new),
      switchMapTo(this.route.paramMap),
      map((paramMap: ParamMap): string | null => paramMap.get('id')),
      this.navigateAwayIfFalsy(),
      switchMap((id: string): Observable<AdminWorkshop | undefined> => {
        return this.adminWorkshopsService.getWorkshop$(id);
      }),
      this.navigateAwayIfFalsy(),
      tap(async (workshop: AdminWorkshop): Promise<void> => {
        this._workshop$.next(workshop);
      }),
      map(_ => {
      })
    );
  }

  private navigateAwayIfFalsy<T>(): (source: Observable<T>) => Observable<Exclude<T, undefined | null>> {
    return source => source.pipe(
      tap(async (data: T): Promise<void> => {
        if (!data) await this.router.navigate(['..', 'unknown'], {relativeTo: this.route});
      }),
      takeWhile((data: T): boolean => !!data),
      map((data: T): Exclude<T, undefined | null> => data as Exclude<T, undefined | null>)
    );
  }

  private readonly subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
