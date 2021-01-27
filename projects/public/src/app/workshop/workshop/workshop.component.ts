import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {PublicWorkshop, UserWorkshop} from '../../../../../../firestore-interfaces';
import {PosterService, PosterUrls} from '../../services/poster/poster.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {isUserWorkshop, Workshop} from '../../helpers/workshops';

@Component({
  selector: 'app-workshop',
  templateUrl: './workshop.component.html',
  styleUrls: ['./workshop.component.scss']
})
export class WorkshopComponent {
  readonly publicWorkshop$: Observable<Readonly<PublicWorkshop>>;
  readonly userWorkshop$: Observable<Readonly<UserWorkshop> | undefined>;
  readonly containerClass$: Observable<'wide-container' | 'thin-container'>;
  readonly posterUrls$: Observable<PosterUrls>;
  readonly sanitizedRecordingUrl$: Observable<SafeResourceUrl>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly posterService: PosterService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly sanitizer: DomSanitizer
  ) {
    const workshop$ = this.getWorkshop$();
    this.publicWorkshop$ = workshop$;
    this.userWorkshop$ = this.getUserWorkshop$(workshop$);
    this.containerClass$ = this.getContainerClass$();
    this.posterUrls$ = this.getPosterUrl$();
    this.sanitizedRecordingUrl$ = this.getSanitizedRecordingUrl$();
  }

  private getWorkshop$(): Observable<Readonly<Workshop>> {
    return this.route.data.pipe(
      switchMap(data => data.workshop$ as Observable<Readonly<Workshop>>),
      shareReplay(1)
    );
  }

  private getUserWorkshop$(workshop$: Observable<Readonly<Workshop>>): Observable<Readonly<UserWorkshop> | undefined> {
    return workshop$.pipe(
      map(workshop =>
        isUserWorkshop(workshop)
          ? workshop as Readonly<UserWorkshop>
          : undefined
      ),
      shareReplay(1)
    );
  }

  private getContainerClass$(): Observable<'wide-container' | 'thin-container'> {
    return this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).pipe(
      map(state => state.matches),
      map(matches => matches ? 'wide-container' : 'thin-container'),
      shareReplay(1)
    );
  }

  private getPosterUrl$(): Observable<PosterUrls> {
    return this.publicWorkshop$.pipe(
      switchMap(w => this.posterService.getPosterUrls$(w.id)),
      map(url => url || {webp: '', std: '', original: ''}),
      shareReplay(1)
    );
  }

  private getSanitizedRecordingUrl$(): Observable<SafeResourceUrl> {
    return this.userWorkshop$.pipe(
      map(w => w?.recordingLink),
      map(link => this.sanitizer.bypassSecurityTrustResourceUrl(link || '')),
      shareReplay(1)
    );
  }

}
