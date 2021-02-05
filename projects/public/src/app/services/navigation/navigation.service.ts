import { Injectable } from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {UserService} from '../user/user.service';
import {Observable, of} from 'rxjs';
import {distinctUntilChanged, filter, map, switchMap} from 'rxjs/operators';


export interface NavigationLink {
  name: string;
  link: string;
}


export type NavigationLinks = NavigationLink[];


const PUBLIC_LINKS: NavigationLinks = [
  {name: 'Latest Workshop', link: '/latest'},
  {name: 'All Workshops', link: '/'},
  {name: 'Account', link: '/account'}
];


const PUBLIC_ADMIN_LINKS: NavigationLinks = [
  ...PUBLIC_LINKS,
  {name: 'Admin Dashboard', link: '/admin'}
];


const ADMIN_LINKS: NavigationLinks = [
  {name: 'New Workshop', link: '/admin/new'},
  {name: 'All Workshops', link: '/admin'},
  {name: 'Settings', link: '/admin/settings'},
  {name: 'Public Site', link: '/'}
];


/**
 * A service that provides the links to be displayed in the main navigation.
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  /**
   * The links to be displayed in the main navigation.
   */
  readonly links$ = this.getLinks$();


  constructor(
    private readonly router: Router,
    private readonly userService: UserService
  ) { }


  /**
   * Provides the value for {@link links$}.
   * @private
   */
  private getLinks$(): Observable<NavigationLinks> {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects),
      switchMap(url => {
        if (url.startsWith('/admin')) return of(ADMIN_LINKS);
        return this.getPublicLinks$();
      }),
      distinctUntilChanged()
    );
  }


  /**
   * Provides the navigation links for when the user is in the public part of the site.
   * @private
   */
  private getPublicLinks$(): Observable<NavigationLinks> {
    return this.userService.userState$.pipe(
      map(state => state.isAdmin),
      distinctUntilChanged(),
      map(isAdmin => isAdmin ? PUBLIC_ADMIN_LINKS : PUBLIC_LINKS)
    );
  }


}
