import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';
import {map, take} from 'rxjs/operators';
import {UserService} from '../../services/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.auth.user.pipe(
      take(1),
      map(user => {
        if (!user) return true;
        return this.router.parseUrl(this.userService.redirectUrl());
      })
    );
  }

  constructor(
    private readonly auth: AngularFireAuth,
    private readonly router: Router,
    private readonly userService: UserService
  ) { }
}
