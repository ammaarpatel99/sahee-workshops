import { Injectable } from '@angular/core';
import {from, Observable} from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';
import {first, switchMap} from 'rxjs/operators';
import {UserDoc, FIRESTORE_PATHS as PATHS} from '@firebase-helpers';


/**
 * A service to be used only in the account component.
 */
@Injectable({
  providedIn: 'root'
})
export class AccountService {
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
}
