import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  CanLoad
} from '@angular/router';
import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';
import {UserService} from '../../services/user/user.service';


@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild, CanLoad {
  canActivate(): Observable<boolean> {
    return this.guard();
  }
  canActivateChild(): Observable<boolean> {
    return this.guard();
  }
  canLoad(): Observable<boolean> {
    return this.guard();
  }


  /**
   * Returns an observable that emits whether the current use is an admin.
   * @private
   */
  private guard(): Observable<boolean> {
    return this.userService.isAdmin$.pipe(
      first()
    );
  }


  constructor(
    private readonly userService: UserService
  ) { }
}
