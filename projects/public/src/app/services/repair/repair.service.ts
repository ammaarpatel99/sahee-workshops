import { Injectable } from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {functions as f, RestoreAdminsParam, RestoreAdminsRes} from '@firebase-helpers';
import {Observable, of} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';
import {first, mapTo, switchMap} from 'rxjs/operators';


/**
 * A service for doing repairs to the system.
 */
@Injectable({
  providedIn: 'root'
})
export class RepairService {
  /**
   * A function which calls the firebase function which restores core admins
   * @private
   */
  private readonly _restoreAdmins$ = this.functions.httpsCallable<RestoreAdminsParam, RestoreAdminsRes>(f.admin.restore);


  /**
   * An observable that restores admin privileges to a pre-defined set of users, and returns their emails.
   * @returns - An observable that emits once and then completes.
   */
  restoreAdmins$(): Observable<string[]> {
    return this._restoreAdmins$().pipe(
      switchMap(newAdmins => {
        return this.auth.user.pipe(
          first(),
          switchMap(user => {
            if (!user?.email) return of(null);
            if (!newAdmins.includes(user.email)) of(null);
            return user.getIdTokenResult(true);
          }),
          mapTo(newAdmins)
        );
      })
    );
  }


  constructor(
    private readonly functions: AngularFireFunctions,
    private readonly auth: AngularFireAuth
  ) { }
}
