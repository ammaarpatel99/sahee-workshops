import { Injectable } from '@angular/core';
import {from, Observable, of} from 'rxjs';
import {first, map, shareReplay, switchMap} from 'rxjs/operators';
import {FIRESTORE_PATHS as PATHS, UserDoc} from '@firebase-helpers';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';


/**
 * A service for getting and setting a users general consent to emails
 */
@Injectable({
  providedIn: 'root'
})
export class ConsentService {
  /**
   * An observable which emits the user's consent to general emails.
   * It emits null if the consent is not set (which could be because there is no user).
   * The observable doesn't complete and may emit multiple times.
   */
  readonly emailConsent$ = this.getEmailConsent$();


  /**
   * An observable which updates the current user's consent to general emails.
   * This requires their to be a user currently signed in.
   * @param newConsent - The new value for consent to save.
   * @returns - An observable which only emits once and then completes.
   */
  updateConsent$(newConsent: boolean): Observable<void> {
    return this.auth.user.pipe(
      first(),
      switchMap(user => {
        if (!user) throw new Error(`Can't update consent as their is no user.`);
        return from(
          this.firestore.doc<UserDoc>(PATHS.user.doc(user.uid))
            .update({consentToEmails: newConsent})
        );
      })
    );
  }


  constructor(
    private readonly firestore: AngularFirestore,
    private readonly auth: AngularFireAuth
  ) { }


  /**
   * Provides the value for {@link emailConsent$}
   * @private
   */
  private getEmailConsent$(): Observable<boolean | null> {
    return this.auth.user.pipe(
      switchMap(user => {
        if (!user) return of(undefined);
        return this.firestore.doc<UserDoc>(PATHS.user.doc(user.uid)).valueChanges();
      }),
      map(data => {
        if (data?.consentToEmails === true || data?.consentToEmails === false) return data.consentToEmails;
        return null;
      }),
      shareReplay(1)
    );
  }
}
