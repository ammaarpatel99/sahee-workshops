import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {functions as f, MakeAdminParam, MakeAdminRes, RemoveAdminParam, RemoveAdminRes} from '@firebase-helpers';
import {UserService} from '../user/user.service';
import {AngularFireFunctions} from '@angular/fire/functions';
import {first, switchMap} from 'rxjs/operators';


/**
 * A service to grant and remove admin privileges from users.
 */
@Injectable({
  providedIn: 'root'
})
export class ManageAdminsService {
  /**
   * A function which calls the firebase function to make a user an admin.
   * @private
   */
  private readonly _makeAdmin$ =
    this.functions.httpsCallable<MakeAdminParam, MakeAdminRes>(f.admin.make);
  /**
   * A function which calls the firebase function to remove a user's admin privileges.
   * @private
   */
  private readonly _removeAdmin$ =
    this.functions.httpsCallable<RemoveAdminParam, RemoveAdminRes>(f.admin.remove);


  /**
   * An observable which makes another user an admin.
   * This requires the current user to be an admin.
   * @param emailAddress - The email address of the user to make an admin.
   * @returns - An observable that only emits once and then completes.
   */
  makeAdmin$(emailAddress: string): Observable<void> {
    return this.userService.userState$.pipe(
      first(),
      switchMap(userState => {
        if (!userState.isAdmin) throw new Error(`Can't make user admin as current user isn't admin.`);
        return this._makeAdmin$({emailAddress});
      })
    );
  }


  /**
   * An observable which removes admin privileges from another user.
   * This requires the current user to be an admin.
   * @param emailAddress - The email address of the user to remove admin privileges from.
   * @returns - An observable that only emits once and then completes.
   */
  removeAdmin$(emailAddress: string): Observable<void> {
    return this.userService.userState$.pipe(
      first(),
      switchMap(userState => {
        if (!userState.isAdmin) throw new Error(`Can't remove admin privileges as current user isn't admin.`);
        return this._removeAdmin$({emailAddress});
      })
    );
  }


  constructor(
    private readonly userService: UserService,
    private readonly functions: AngularFireFunctions
  ) { }
}
