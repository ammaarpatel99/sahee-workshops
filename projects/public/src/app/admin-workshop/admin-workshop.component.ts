import {Component} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map, shareReplay, switchMap, takeUntil} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {AdminWorkshop} from '@firebase-helpers';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {WorkshopStats, WorkshopStatsService} from '../services/workshop-stats/workshop-stats.service';
import {CleanRxjs} from '../helpers/clean-rxjs/clean-rxjs';


@Component({
  selector: 'app-admin-workshop',
  templateUrl: './admin-workshop.component.html',
  styleUrls: ['./admin-workshop.component.scss']
})
export class AdminWorkshopComponent extends CleanRxjs {
  /**
   * The workshop the user is viewing/editing.
   */
  readonly workshop$ = this.getWorkshop$();
  /**
   * A class to be put on the component container to make the content responsive.
   */
  readonly containerClass$ = this.getContainerClass$();
  /**
   * Stats regarding the workshop being viewed (the number of people registered etc).
   */
  readonly stats$ = this.fetchStats$();


  constructor(
    private readonly route: ActivatedRoute,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly workshopStatsService: WorkshopStatsService
  ) { super(); }


  /**
   * Provides value for {@link workshop$}.
   * @private
   */
  private getWorkshop$(): Observable<Readonly<AdminWorkshop> | null> {
    return this.route.data.pipe(
      switchMap(data => {
        if (data.new) return of(null);
        return data.workshop$ as Observable<Readonly<AdminWorkshop>>;
      })
    );
  }


  /**
   * Provides the value for {@link containerClass$}.
   * @private
   */
  private getContainerClass$(): Observable<'wide-container' | 'thin-container'> {
    return this.breakpointObserver.observe(
      [Breakpoints.Handset,
        Breakpoints.Tablet
      ]).pipe(
      map(state => state.matches),
      map(matches => matches ? 'wide-container' : 'thin-container'),
      takeUntil(this.destroy$),
      shareReplay(1)
    );
  }


  /**
   * Provides value for {@link stats$}.
   * @private
   */
  private fetchStats$(): Observable<Readonly<WorkshopStats> | null> {
    return this.workshop$.pipe(
      switchMap(workshop => workshop ? this.workshopStatsService.workshop$(workshop.id) : of(null))
    );
  }

}
