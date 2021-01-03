import { Component, OnInit } from '@angular/core';
import {WorkshopsService} from '../../services/workshops/workshops.service';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {PublicWorkshop} from '../../../../../../firestore-interfaces/public-workshops/public-workshop';
import {PosterService} from '../../services/poster/poster.service';

@Component({
  selector: 'app-workshops-dashboard',
  templateUrl: './workshops-dashboard.component.html',
  styleUrls: ['./workshops-dashboard.component.scss']
})
export class WorkshopsDashboardComponent implements OnInit {
  readonly workshops$: Observable<Readonly<PublicWorkshop>[]> = this.workshopsService.workshops$;
  readonly unknownRoute$: Observable<boolean>;
  readonly allowNew$: Observable<boolean>;

  getPosterUrl$(id: string): Observable<string | undefined> {
    return this.posterService.getPosterUrl$(id);
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
  }

  private checkForRouteData$(name: string): Observable<boolean> {
    return this.route.data.pipe(
      map(data => !!data[name])
    );
  }

}
