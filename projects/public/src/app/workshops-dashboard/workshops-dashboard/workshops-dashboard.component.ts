import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {PublicWorkshop} from '../../../../../../functions/src/firebase-helpers/firestore-interfaces';
import {PosterService, PosterUrls} from '../../services/poster-old/poster.service';
import {Workshop} from '../../helpers/workshops';

@Component({
  selector: 'app-workshops-dashboard',
  templateUrl: './workshops-dashboard.component.html',
  styleUrls: ['./workshops-dashboard.component.scss']
})
export class WorkshopsDashboardComponent implements OnDestroy {
  public readonly workshops$: Observable<Readonly<PublicWorkshop>[]>;
  public readonly unknownRoute$: Observable<boolean>;
  public readonly allowNew$: Observable<boolean>;
  private readonly posterUrls = new Map<string, PosterUrls | null>();

  public workshopIsInFuture(workshop: Workshop): boolean {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return workshop.jsDate >= date;
  }

  public poster(workshopID: string): PosterUrls {
    const urls = this.posterUrls.get(workshopID);
    if (!urls) return {webp: '', original: '', std: ''};
    return urls;
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly posterService: PosterService
  ) {
    this.unknownRoute$ = this.checkForRouteData$('unknown');
    this.allowNew$ = this.checkForRouteData$('allowNew');
    this.workshops$ = this.getWorkshops$();
    this.subscriptions.push(this.watchPosterUrls$().subscribe());
  }

  private checkForRouteData$(name: string): Observable<boolean> {
    return this.route.data.pipe(
      map(data => !!data[name])
    );
  }

  private getWorkshops$(): Observable<Readonly<PublicWorkshop>[]> {
    return this.route.data.pipe(
      switchMap(data => data.workshops$ as Observable<Readonly<PublicWorkshop>[]>)
    );
  }

  private watchPosterUrls$(): Observable<void> {
    return this.workshops$.pipe(
      map(workshops => {
        for (const w of workshops) {
          const currentUrls = this.posterUrls.get(w.id);
          if (!!currentUrls) continue;
          this.posterUrls.set(w.id, {webp: '', original: '', std: ''});
          this.subscriptions.push(this.getPosterUrls$(w.id).subscribe());
        }
      })
    );
  }

  private getPosterUrls$(workshopID: string): Observable<void> {
    return this.posterService
      .getPosterUrls$(workshopID)
      .pipe(
        map(posterUrls => {
          this.posterUrls.set(workshopID, posterUrls);
        })
      );
  }

  private readonly subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
