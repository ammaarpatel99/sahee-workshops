import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {Observable} from 'rxjs';

const LINKS = {
  PUBLIC: [
    {name: 'Latest Workshop', link: '/latest'},
    {name: 'All Workshops', link: '/'},
    {name: 'Account', link: '/account'},
    {name: 'Admin Dashboard', link: '/admin'}
  ],
  ADMIN: [
    {name: 'New Workshop', link: '/admin/new'},
    {name: 'All Workshops', link: '/admin'},
    {name: 'Settings', link: '/admin/settings'},
    {name: 'Public Site', link: '/'}
  ]
};

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  /**
   * An observable which emits an array of links to be displayed in the sidenav.
   * <br/>
   * It never completes and checks the links when {@link Router#events} emits {@link NavigationEnd}.
   * However it only emits if the links have changed.
   */
  public readonly links$: Observable<{ name: string; link: string; }[]>;

  constructor(
    private readonly router: Router
  ) {
    this.links$ = this.getLinks$();
  }

  /**
   * @returns - The value for {@link links$}.
   */
  private getLinks$(): Observable<{ name: string, link: string }[]> {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects),
      map(url => url.startsWith('/admin') ? LINKS.ADMIN : LINKS.PUBLIC),
      distinctUntilChanged()
    );
  }
}
