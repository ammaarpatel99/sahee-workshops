import {Component, OnDestroy, OnInit} from '@angular/core';
import {WorkshopsService} from '../../services/workshops/workshops.service';
import {ActivatedRoute} from '@angular/router';
import {Observable, of, Subscription} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {PublicWorkshop} from '../../../../../../firestore-interfaces/public-workshops/public-workshop';
import {PosterService} from '../../services/poster/poster.service';

@Component({
  selector: 'app-workshops-dashboard',
  templateUrl: './workshops-dashboard.component.html',
  styleUrls: ['./workshops-dashboard.component.scss']
})
export class WorkshopsDashboardComponent implements OnInit, OnDestroy {
  readonly workshops$: Observable<Readonly<PublicWorkshop>[]> = this.workshopsService.workshops$;
  readonly unknownRoute$: Observable<boolean>;
  readonly allowNew$: Observable<boolean>;
  private readonly posterUrls = new Map<string, string>();

  getPosterUrl(id: string): string {
    return this.posterUrls.get(id) || '';
  }

  posterUrl(workshopID: string): string {
    return `public/workshops/${workshopID}/poster`;
  }

  constructor(
    private workshopsService: WorkshopsService,
    private route: ActivatedRoute,
    private posterService: PosterService
  ) {
    this.unknownRoute$ = this.checkForRouteData$('unknown');
    this.allowNew$ = this.checkForRouteData$('allowNew');
  }

  ngOnInit(): void {
    this.subscriptions.push(this.getPosters$().subscribe());
  }

  private getPosters$(): Observable<void> {
    return this.workshops$.pipe(
      map(workshops => {
        for (const w of workshops) {
          this.posterService.getPosterUrl$(w.id).pipe(
            tap(url => this.posterUrls.set(w.id, url || ''))
          ).toPromise();
        }
      })
    );
  }

  private checkForRouteData$(name: string): Observable<boolean> {
    return this.route.data.pipe(
      map(data => !!data[name])
    );
  }

  private subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
