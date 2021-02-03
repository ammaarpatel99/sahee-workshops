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
import {UserService} from '../../services/user-old/user.service';
import {AngularFireAuth} from '@angular/fire/auth';
import {map, take, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuard implements CanActivate, CanActivateChild, CanLoad {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.guard(state.url);
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.guard(state.url);
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.guard(segments.join(''));
  }

  private guard(currentUrl: string): Observable<true | UrlTree> {
    return this.auth.user.pipe(
      take(1),
      map(user => {
        if (user) return true;
        const url = this.userService.signIn(currentUrl);
        return this.router.parseUrl(url);
      })
    );
  }

  constructor(
    private readonly userService: UserService,
    private readonly auth: AngularFireAuth,
    private readonly router: Router
  ) { }
}
