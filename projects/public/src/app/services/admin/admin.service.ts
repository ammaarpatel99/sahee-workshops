import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {distinctUntilChanged, map, shareReplay, switchMap, switchMapTo, take} from 'rxjs/operators';
import {from, Observable, of} from 'rxjs';
import {FirebaseFunctionsService} from '../firebase-functions/firebase-functions.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // TODO: move isAdmin$ somewhere else so that this service is lazy-loaded properly
  /**
   * An observable that emits whether the current user is an admin (or undefined if there is no user).
   * <br/>
   * The observable doesn't complete and is based on {@link AngularFireAuth#idTokenResult}.
   * The observable only emits when its value changes, and is multicast using {@link shareReplay shareReplay(1)};
   */
  public readonly isAdmin$: Observable<boolean | undefined>;

  /**
   * Used to grant admin privileges to a user, identified by their email address.
   * Requires the current user to be an admin, as assessed by {@link isAdmin$}.
   * @param emailAddress - The email address of the user to grant admin privileges to.
   * @returns An observable which when subscribed to grants the admin privileges.
   * The observable only emits once and then completes.
   */
  public makeAdmin$(emailAddress: string): Observable<void> {
    return this.isAdmin$.pipe(
      take(1),
      map(isAdmin => {
        if (!isAdmin) throw new Error(`User isn't admin so can't make others admin.`);
      }),
      switchMapTo(this.functions.makeAdmin$(emailAddress))
    );
  }

  /**
   * Used to remove admin privileges from a user, identified by their email address.
   * Requires the current user to be an admin, as assessed by {@link isAdmin$}.
   * @param emailAddress - The email address of the user to remove admin privileges from.
   * @returns An observable which when subscribed to removes the admin privileges.
   * The observable only emits once and the completes.
   */
  public removeAdmin$(emailAddress: string): Observable<void> {
    return this.isAdmin$.pipe(
      take(1),
      map(isAdmin => {
        if (!isAdmin) throw new Error(`User isn't admin so can't remove admin role from others.`);
      }),
      switchMapTo(this.functions.removeAdmin$(emailAddress))
    );
  }

  /**
   * Used to grant admin privileges to a pre-defined set of users (which is set on the back-end).
   * @returns An observable that grants the admin privileges
   * and then emits the emails of the users affected (even if they had admin privileges before).
   * The observable only emits once and then completes.
   */
  public restoreAdmins$(): Observable<string[]> {
    return this.functions.restoreAdmins$().pipe(
      switchMap(adminEmails =>
        // Check if the user is amongst those made admin, and if so forcefully update
        // their idTokenResult to ensure the application recognises their possibly new privileges.
        this.auth.user.pipe(
          take(1),
          switchMap(user => {
            if (!user?.email || !adminEmails.includes(user.email)) {
              return of(undefined);
            }
            return from(user.getIdTokenResult(true));
          }),
          map(_ => adminEmails),
        )
      )
    );
  }

  constructor(
    private readonly auth: AngularFireAuth,
    private readonly functions: FirebaseFunctionsService
  ) {
    this.isAdmin$ = this.getIsAdmin$();
  }

  /**
   * @returns The value for {@link isAdmin$}.
   */
  private getIsAdmin$(): Observable<boolean | undefined> {
    return this.auth.idTokenResult.pipe(
      map(idTokenResult => {
        if (!idTokenResult) return undefined;
        return idTokenResult.claims.admin === true;
      }),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

}
