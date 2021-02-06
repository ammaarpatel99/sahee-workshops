import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {distinctUntilChanged, filter, map, shareReplay, switchMap, takeUntil} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {UserWorkshop} from '@firebase-helpers';
import {PosterService, PosterUrls} from '../services/poster-old/poster.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {isUserWorkshop, Workshop} from '../helpers/workshops';
import {CleanRxjs} from '../helpers/clean-rxjs/clean-rxjs';


@Component({
  selector: 'app-workshop',
  templateUrl: './workshop.component.html',
  styleUrls: ['./workshop.component.scss']
})
export class WorkshopComponent extends CleanRxjs implements OnDestroy {
  /**
   * An observable that emits the data of the workshop to be displayed.
   * <br/>
   * It never completes and emits on changes.
   */
  readonly workshop$ = this.getWorkshop$();
  /**
   * An observable that emits the poster urls for the workshop being displayed.
   * <br/>
   * It never completes and emits on changes.
   */
  readonly posterUrls$ = this.getPosterUrls$();
  /**
   * An observable that emits the user's data of the workshop to be displayed.<br/>
   * It never completes and emits on changes.
   */
  readonly userWorkshop$ = this.getUserWorkshop$();
  /**
   * An observable that emits the recording url from {@link userWorkshop$},
   * but as a {@link SafeResourceUrl} so the video can be displayed.
   */
  readonly sanitizedRecordingUrl$ = this.getSanitizedRecordingUrl$();
  /**
   * An observable that emits a class to put on the component container to
   * make the content responsive.
   */
  readonly containerClass$ = this.getContainerClass$();


  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly posterService: PosterService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly sanitizer: DomSanitizer
  ) { super(); }


  /**
   * Provides the value for {@link workshop$}.
   * @private
   */
  private getWorkshop$(): Observable<Readonly<Workshop>> {
    return this.route.data.pipe(
      switchMap(data => data.workshop$ as Observable<Readonly<Workshop> | null>),
      switchMap(workshop => {
        if (!workshop) {
          return this.navigateAway().then(() => null);
        } else return of(workshop);
      }),
      filter(workshop => workshop !== null),
      map(workshop => workshop as Readonly<Workshop>),
      takeUntil(this.destroy$),
      shareReplay(1)
    );
  }


  /**
   * Navigates away from this component to ./.. (which should be the workshop dashboard).
   * <br/>
   * If the navigation fails it throws an error.
   * @private
   */
  private async navigateAway(): Promise<void> {
    const res = await this.router.navigate(['..'], {relativeTo: this.route});
    if (!res) throw new Error(`Can't navigate away from workshop page.`);
  }


  /**
   * Provides the value for {@link posterUrls$}.
   * @private
   */
  private getPosterUrls$(): Observable<Readonly<PosterUrls>> {
    return this.workshop$.pipe(
      map(workshop => workshop.id),
      distinctUntilChanged(),
      switchMap(id => this.posterService.getPosterUrls$(id)),
      shareReplay(1)
    );
  }


  /**
   * Provides the value for {@link userWorkshop$}.
   * @private
   */
  private getUserWorkshop$(): Observable<Readonly<UserWorkshop> | null> {
    return this.workshop$.pipe(
      map(workshop =>
        isUserWorkshop(workshop)
          ? workshop
          : null
      ),
      shareReplay(1)
    );
  }


  /**
   * Provides the value for {@link sanitizedRecordingUrl$}.
   * @private
   */
  private getSanitizedRecordingUrl$(): Observable<Readonly<SafeResourceUrl>> {
    return this.userWorkshop$.pipe(
      map(w => w?.recordingLink),
      distinctUntilChanged(),
      map(link => this.sanitizer.bypassSecurityTrustResourceUrl(link || '')),
      shareReplay(1)
    );
  }


  /**
   * Provides the value for {@link containerClass$}.
   * @private
   */
  private getContainerClass$(): Observable<'wide-container' | 'thin-container'> {
    return this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).pipe(
      map(state => state.matches),
      map(matches => matches ? 'wide-container' : 'thin-container'),
      takeUntil(this.destroy$),
      shareReplay(1)
    );
  }
}
