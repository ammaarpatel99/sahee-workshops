import {Injectable, OnDestroy} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter, map, tap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';

const LINKS = {
  PUBLIC: [
    {name: 'Workshops', link: '/'},
    {name: 'Account', link: '/account'}
  ],
  ADMIN: [
    {name: 'Workshops', link: '/admin/workshops'}
  ]
};

@Injectable({
  providedIn: 'root'
})
export class SidenavService implements OnDestroy {
  private readonly _links = new BehaviorSubject<typeof LINKS.PUBLIC>(LINKS.PUBLIC);
  readonly links = this._links.asObservable();
  private readonly subscription;

  constructor(
    private router: Router
  ) {
    this.subscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event as NavigationEnd),
      map(event => event.urlAfterRedirects),
      tap(url => {
        if (url.startsWith('/admin')) {
          if (this._links.value !== LINKS.ADMIN) this._links.next(LINKS.ADMIN);
        } else {
          if (this._links.value !== LINKS.PUBLIC) this._links.next(LINKS.PUBLIC);
        }
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
