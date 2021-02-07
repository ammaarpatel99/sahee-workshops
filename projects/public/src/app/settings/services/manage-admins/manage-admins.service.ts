import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {functions as f, MakeAdminParam, MakeAdminRes, RemoveAdminParam, RemoveAdminRes} from '@firebase-helpers';
import {UserService} from '../../../services/user/user.service';
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
  private readonly _makeAdmin$ = this.functions.httpsCallable<MakeAdminParam, MakeAdminRes>(f.admin.make);
  /**
   * A function which calls the firebase function to remove a user's admin privileges.
   * @private
   */
  private readonly _removeAdmin$ = this.functions.httpsCallable<RemoveAdminParam, RemoveAdminRes>(f.admin.remove);


  /**
   * An observable which makes another user an admin.
   * This requires the current user to be an admin.
   * @param emailAddress - The email address of the user to make an admin.
   * @returns - An observable that only emits once and then completes.
   */
  makeAdmin$(emailAddress: string): Observable<void> {
    return this.switchIfAdmin$(this._makeAdmin$({emailAddress}),
      `Can't grant admin privileges.`);
  }


  /**
   * An observable which removes admin privileges from another user.
   * This requires the current user to be an admin.
   * @param emailAddress - The email address of the user to remove admin privileges from.
   * @returns - An observable that only emits once and then completes.
   */
  removeAdmin$(emailAddress: string): Observable<void> {
    return this.switchIfAdmin$(this._removeAdmin$({emailAddress}),
      `Can't remove admin privileges.`);
  }


  /**
   * An observable which switches to obs$ or throws an error with the message errMessage.<br/>
   * The error is thrown if the user isn't an admin.
   * @param obs$ - The observable to switch to.
   * @param errMessage - The error message.
   * @private
   */
  private switchIfAdmin$<T>(obs$: Observable<T>, errMessage: string): Observable<T> {
    throw new Error(`Manage admins functionality not available.`);
    /*return this.userService.isAdmin$.pipe(
      first(),
      switchMap(isAdmin => {
        if (isAdmin) return obs$;
        throw new Error(errMessage);
      })
    );*/
  }


  constructor(
    private readonly userService: UserService,
    private readonly functions: AngularFireFunctions
  ) { }
}
