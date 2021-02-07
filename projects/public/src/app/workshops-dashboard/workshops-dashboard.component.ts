import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {distinctUntilChanged, map, shareReplay, takeUntil} from 'rxjs/operators';
import {PosterService, PosterUrls} from '../services/poster/poster.service';
import {CleanRxjs} from '../helpers/clean-rxjs/clean-rxjs';
import {PublicWorkshopsService} from '../services/public-workshops/public-workshops.service';
import {PublicWorkshop} from '@firebase-helpers';


type PosterUrls$ = Observable<Readonly<PosterUrls>>;


interface DisplayedWorkshop extends PublicWorkshop {
  inFuture: boolean;
  posterUrls$: PosterUrls$;
}


@Component({
  selector: 'app-workshops-dashboard',
  templateUrl: './workshops-dashboard.component.html',
  styleUrls: ['./workshops-dashboard.component.scss']
})
export class WorkshopsDashboardComponent extends CleanRxjs implements OnDestroy {
  /**
   * An observable that emits data on workshops to be displayed.
   */
  public readonly workshops$ = this.getWorkshops$();
  /**
   * An observable that emits whether the current route is for an unknown workshop.
   */
  public readonly unknownWorkshop$ = this.checkForRouteData$('unknown');
  /**
   * An observable that emits whether the user is allowed to  create a new workshop.
   */
  public readonly allowNew$ = this.checkForRouteData$('allowNew');


  constructor(
    private readonly route: ActivatedRoute,
    private readonly publicWorkshopsService: PublicWorkshopsService,
    private readonly posterService: PosterService
  ) { super(); }


  /**
   * Provides value for {@link workshops$}.
   * @private
   */
  private getWorkshops$(): Observable<DisplayedWorkshop[]> {
    return this.publicWorkshopsService.workshops$.pipe(
      map(workshops => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return workshops.map(w => ({...w, inFuture: w.jsDate >= today}));
      }),
      map(workshops => workshops.map(w => {
        return {...w, posterUrls$: this.posterService.getPosterUrls$(w.id)};
      }))
    );
  }


  /**
   * An observable that checks the route data for a field with the given name,
   * and returns whether it is truthy or not.
   * @param name - The name of the route data field.
   * @returns - An observable that never completes and emits on changes.
   * @private
   */
  private checkForRouteData$(name: string): Observable<boolean> {
    return this.route.data.pipe(
      map(data => !!data[name]),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      shareReplay(1)
    );
  }
}
