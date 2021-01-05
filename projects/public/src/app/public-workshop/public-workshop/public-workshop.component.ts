import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {WorkshopsService} from '../../services/workshops/workshops.service';
import {map, switchMap, takeWhile, tap} from 'rxjs/operators';
import {Observable, ReplaySubject, Subscription} from 'rxjs';
import {PublicWorkshop} from '../../../../../../firestore-interfaces/public-workshops/public-workshop';
import {UserWorkshop} from '../../../../../../firestore-interfaces/users/user-workshops/user-workshop';
import {PosterService} from '../../services/poster/poster.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-public-workshop',
  templateUrl: './public-workshop.component.html',
  styleUrls: ['./public-workshop.component.scss']
})
export class PublicWorkshopComponent implements OnInit, OnDestroy {
  private readonly _publicWorkshop$ = new ReplaySubject<Readonly<PublicWorkshop>>(1);
  readonly publicWorkshop$ = this._publicWorkshop$.asObservable();
  private readonly _userWorkshop$ = new ReplaySubject<Readonly<UserWorkshop | undefined>>(1);
  readonly userWorkshop$ = this._userWorkshop$.asObservable();
  private readonly _containerClass$ = new ReplaySubject<string>(1);
  readonly containerClass$ = this._containerClass$.asObservable();
  private readonly posterUrls = new Map<string, string>();

  sanitizeRecordingUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getPosterUrl(id: string): string {
    return this.posterUrls.get(id) || '';
  }

  posterUrl(workshopID: string): string {
    return `public/workshops/${workshopID}/poster`;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workshopsService: WorkshopsService,
    private posterService: PosterService,
    private breakpointObserver: BreakpointObserver,
    private sanitizer: DomSanitizer
  ) {
    this.subscriptions.push(this.getData$().subscribe());
    this.subscriptions.push(this.watchBreakpoints$().subscribe());
  }

  private watchBreakpoints$(): Observable<void> {
    return this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.TabletPortrait]).pipe(
      map(state => state.matches),
      map(matches => {
        this._containerClass$.next(matches ? 'wide-container' : 'thin-container');
      })
    );
  }

  private getData$(): Observable<void> {
    return this.route.paramMap.pipe(
      map(paramMap => paramMap.get('id')),
      this.navigateAwayIfFalsy(),
      switchMap(id => this.workshopsService.getWorkshop$(id)),
      this.navigateAwayIfFalsy(),
      map(workshop => {
        this._publicWorkshop$.next(workshop);
        if (PublicWorkshopComponent.isUserWorkshop(workshop)) this._userWorkshop$.next(workshop);
        else this._userWorkshop$.next(undefined);
      })
    );
  }

  private static isUserWorkshop(workshop: Readonly<UserWorkshop> | Readonly<PublicWorkshop>): workshop is Readonly<UserWorkshop> {
    return (workshop as Readonly<UserWorkshop>).consentToEmails !== undefined;
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

  ngOnInit(): void {
    this.subscriptions.push(this.getPoster$().subscribe());
  }

  private getPoster$(): Observable<void> {
    return this.publicWorkshop$.pipe(
      map(w => {
        this.posterService.getPosterUrl$(w.id).pipe(
          tap(url => this.posterUrls.set(w.id, url || ''))
        ).toPromise();
      })
    );
  }

  private readonly subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
