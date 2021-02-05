import { Injectable } from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {functions as f, SupportParam, SupportRes} from '@firebase-helpers';
import {Observable, of} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';
import {first, map, switchMap} from 'rxjs/operators';


/**
 * A service used to request support.
 */
@Injectable({
  providedIn: 'root'
})
export class SupportService {
  /**
   * A function that calls the firebase function that sends a support request.
   * @private
   */
  private readonly _support$ = this.functions.httpsCallable<SupportParam, SupportRes>(f.support);


  /**
   * An observable that sends a support request.
   * @param message - The support message to send.
   * @param email - The email to reply to. If not provided then the function gets the current user's email.
   * If there is no current user, or they don't have an email, then the observable errors.
   * @returns - An observable that emits once and then completes.
   */
  support$(message: string, email?: string): Observable<void> {
    return of(email).pipe(
      switchMap(_email => {
        if (_email) return of(_email);
        return this.auth.user.pipe(
          first(),
          map(user => {
            if (user?.email) return user.email;
            throw new Error(`Can't send support request as there is no email to reply to.`);
          })
        );
      }),
      switchMap(_email => this._support$({email: _email, message}))
    );
  }


  constructor(
    private readonly functions: AngularFireFunctions,
    private readonly auth: AngularFireAuth
  ) { }
}
