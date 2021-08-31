import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import {first, map} from 'rxjs/operators';
import {SignedInState, UserService} from '../../services/user/user.service';


@Injectable({
  providedIn: 'root'
})
export class LoggedInGuard implements CanActivate, CanActivateChild, CanLoad {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<true | UrlTree> {
    return this.guard(state.url);
  }
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<true | UrlTree> {
    return this.guard(state.url);
  }
  canLoad(route: Route, segments: UrlSegment[]): Observable<true | UrlTree> {
    return this.guard(segments.join(''));
  }


  /**
   * If the user is signed in, the returned observable emits true.
   * Otherwise it emits the {@link UrlTree} of the url from {@link UserService#signInUrl signInUrl(currentUrl)}.
   * @param currentUrl - The url the user is trying to reach.
   * @private
   */
  private guard(currentUrl: string): Observable<true | UrlTree> {
    return this.userService.userState$.pipe(
      first(),
      map(userState => {
        if (userState.signedInState !== SignedInState.NO_USER) return true;
        const url = this.userService.signInUrl(currentUrl);
        return this.router.parseUrl(url);
      })
    );
  }


  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) { }
}
