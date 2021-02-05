import {Component, OnDestroy} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {Observable, of} from 'rxjs';
import {filter, first, map, shareReplay, switchMap, takeUntil} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';
import {MatSidenav} from '@angular/material/sidenav';
import {NavigationService} from '../services/navigation/navigation.service';
import {CleanRxjs} from '../helpers/clean-rxjs/clean-rxjs';


@Component({
  selector: 'app-nav-container',
  templateUrl: './nav-container.component.html',
  styleUrls: ['./nav-container.component.scss']
})
export class NavContainerComponent {
  /**
   * Navigation links from {@link NavigationService#links$}.
   */
  readonly links$ = this.navigationService.links$;
  /**
   * An observable that emits whether the device is a handset.
   * This is used to make the component responsive.
   */
  public readonly isHandset$ = this.getIsHandset$();
  /**
   * An observable that emits the title to be displayed in the toolbar.
   * It is needed to make the component responsive (the title adapts based on {@link isHandset$}).
   */
  public readonly title$ = this.getTitle$();
  /**
   * An observable that emits the class to add to the component depending
   * on whether the user is in the admin portal or not.
   */
  public readonly adminTheme$ = this.getAdminTheme$();


  /**
   * Closes the drawer if it is closable (i.e. if it isn't been kept open as part of the responsive design).
   * @param drawer - The HTML drawer component to close.
   */
  closeDrawer(drawer: MatSidenav): Promise<void> {
    return this.isHandset$.pipe(
      first(),
      switchMap(isHandset => {
        if (isHandset) return drawer.close();
        return of(undefined);
      }),
      map(() => {})
    ).toPromise();
  }


  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly router: Router,
    private readonly navigationService: NavigationService
  ) { }


  /**
   * Provides value for {@link isHandset$}.
   * @private
   */
  private getIsHandset$(): Observable<boolean> {
    return this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.TabletPortrait
    ]).pipe(
      map(res => res.matches),
      shareReplay(1)
    );
  }


  /**
   * Provides value for {@link title$}.
   * @private
   */
  private getTitle$(): Observable<'Workshops' | ``> {
    return this.breakpointObserver.observe([Breakpoints.HandsetPortrait]).pipe(
      map(res => res.matches),
      map(matches => matches ? `` : 'Workshops'),
      shareReplay(1)
    );
  }


  /**
   * Provides value for {@link adminTheme$}.
   * @private
   */
  private getAdminTheme$(): Observable<'admin-theme' | ''> {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects.startsWith('/admin') ? 'admin-theme' : ''),
      shareReplay(1)
    );
  }

}
