import {Component} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {AdminWorkshop} from '../../../../../../../firestore-interfaces';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {AdminWorkshopsService, WorkshopStats} from '../../../services/admin-workshops/admin-workshops.service';

@Component({
  selector: 'app-admin-workshop',
  templateUrl: './admin-workshop.component.html',
  styleUrls: ['./admin-workshop.component.scss']
})
export class AdminWorkshopComponent {
  readonly workshop$: Observable<Readonly<AdminWorkshop> | undefined>;
  readonly containerClass$: Observable<'wide-container' | 'thin-container'>;
  readonly stats$: Observable<WorkshopStats | undefined>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly adminWorkshopsService: AdminWorkshopsService
  ) {
    this.workshop$ = this.getWorkshop$();
    this.stats$ = this.fetchStats$();
    this.containerClass$ = this.getContainerClass$();
  }

  private getWorkshop$(): Observable<Readonly<AdminWorkshop> | undefined> {
    return this.route.data.pipe(
      switchMap(data => {
        if (data.new) return of(undefined);
        return data.workshop$ as Observable<Readonly<AdminWorkshop>>;
      }),
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

  private fetchStats$(): Observable<WorkshopStats | undefined> {
    return this.workshop$.pipe(
      switchMap(workshop => workshop ? this.adminWorkshopsService.getWorkshopStats$(workshop.id) : of(workshop))
    );
  }

}
