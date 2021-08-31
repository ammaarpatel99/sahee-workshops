import { Injectable } from '@angular/core';
import {CanActivate, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {first, map} from 'rxjs/operators';
import {SignedInState, UserService} from '../../services/user/user.service';


@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  /**
   * If the user is not signed in, the returned observable emits true.
   * Otherwise it emits the {@link UrlTree} of the url from {@link UserService#redirectUrl redirectUrl()}.
   */
  canActivate(): Observable<true | UrlTree> {
    return this.userService.userState$.pipe(
      first(),
      map(userState => {
        if (userState.signedInState === SignedInState.NO_USER) return true;
        return this.router.parseUrl(this.userService.redirectUrl());
      })
    );
  }


  constructor(
    private readonly router: Router,
    private readonly userService: UserService
  ) { }
}
