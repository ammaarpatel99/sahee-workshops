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
import {from, Observable, of} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';
import {map, switchMap, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild, CanLoad {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.guard();
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.guard();
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.guard();
  }

  private guard(): Observable<true | UrlTree> {
    return this.auth.user.pipe(
      take(1),
      switchMap(user => from(user?.getIdTokenResult() || of(undefined))),
      map(tokenRes => {
        const isAdmin = tokenRes?.claims.admin === true;
        return isAdmin || this.router.parseUrl('/');
      })
    );
  }

  constructor(
    private readonly auth: AngularFireAuth,
    private readonly router: Router
  ) { }
}
