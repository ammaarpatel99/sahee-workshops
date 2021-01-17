import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, Observable} from 'rxjs';
import {map, shareReplay, switchMap, take} from 'rxjs/operators';
import {PublicWorkshop} from '../../../../../../firestore-interfaces';
import {PosterService} from '../../services/poster/poster.service';
import {Workshop} from '../../helpers/workshops';

@Component({
  selector: 'app-workshops-dashboard',
  templateUrl: './workshops-dashboard.component.html',
  styleUrls: ['./workshops-dashboard.component.scss']
})
export class WorkshopsDashboardComponent {
  public readonly workshops$: Observable<Readonly<PublicWorkshop>[]>;
  public readonly unknownRoute$: Observable<boolean>;
  public readonly allowNew$: Observable<boolean>;
  private readonly posterUrls$: Observable<Map<string, string>>;

  public posterUrl$(id: string): Observable<string> {
    return this.posterUrls$.pipe(
      take(1),
      map(urlMap => urlMap.get(id) || '')
    );
  }

  public workshopIsInFuture(workshop: Workshop): boolean {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return workshop.jsDate >= date;
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly posterService: PosterService
  ) {
    this.unknownRoute$ = this.checkForRouteData$('unknown');
    this.allowNew$ = this.checkForRouteData$('allowNew');
    this.workshops$ = this.getWorkshops$();
    this.posterUrls$ = this.getPosterUrls$();
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

  private getPosterUrls$(): Observable<Map<string, string>> {
    return this.workshops$.pipe(
      switchMap(workshops => {
        const urls: Observable<[string, string]>[] = [];
        for (const workshop of workshops) {
          const url$ = this.posterService.getPosterUrl$(workshop.id).pipe(
            map(url => [workshop.id, url] as [string, string])
          );
          urls.push(url$);
        }
        return forkJoin(urls);
      }),
      map(data => new Map<string, string>(data)),
      shareReplay(1)
    );
  }

}
