import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {distinctUntilChanged, map, shareReplay, switchMap, take} from 'rxjs/operators';
import {from, Observable, of} from 'rxjs';
import {UserDoc} from '../../../../../../firestore-interfaces';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  /**
   * The {@link AngularFirestoreCollection} for users.
   */
  private readonly firestoreCollection: AngularFirestoreCollection<UserDoc>;
  /**
   * Whether the current user has consented to general emails (not workshop specific), or undefined if there is no user.
   * <br/>
   * The observable never completes and is based off {@link AngularFireAuth#user}, although it only emits on changes.
   * It is also multicast using {@link shareReplay shareReplay(1)}.
   */
  public readonly emailConsent$: Observable<boolean | undefined>;
  /**
   * The current redirectUrl (or undefined), as used by {@link redirectUrl};
   */
  private _redirectUrl: string|undefined;

  /**
   * Gets the url stored by {@link signIn} and then resets the stored value.
   * @returns The url stored by {@link signIn} or the base url, "/", if there is no stored url.
   */
  public redirectUrl(): string {
    const url = this._redirectUrl;
    if (url !== undefined) this._redirectUrl = undefined;
    return url || '/';
  }

  /**
   * To be called after signing out.
   * Calls {@link signIn} if the current route requires an authenticated user.
   */
  public async signedOut(): Promise<void> {
    const url = this.router.url;
    if (url.startsWith('/admin') || url.startsWith('/account')) return this.signIn();
  }

  /**
   * Stores the current url and then redirect to the login page. The url can then be recovered using {@link redirectUrl}.
   * @returns A promise which resolves when the navigation to the login page completes.
   */
  public signIn(): Promise<void>;
  /**
   * Stores the currentUrl and then returns the url of the login page. The currentUrl can then be recovered using {@link redirectUrl}.
   * @returns The url of the login page.
   */
  public signIn(currentUrl: string): string;
  public signIn(currentUrl?: string): Promise<void> | string {
    this._redirectUrl = currentUrl || this.router.url;
    if (currentUrl) return '/login';
    return new Promise<void>(resolve => {
      this.router.navigateByUrl('/login').then(() => resolve());
    });
  }

  /**
   * User to whether the user has consented to emails. This requires there to be a user logged in.
   * @returns An observable that when subscribed to changes the consent. It only emits once and then completes.
   */
  public setEmailConsent$(consentToEmails: boolean): Observable<void> {
    return this.auth.user.pipe(
      take(1),
      map(user => {
        if (!user) throw new Error(`Can't change consent as there is no user.`);
        return user.uid;
      }),
      switchMap(uid =>
        from(this.firestoreCollection.doc(uid).update({consentToEmails}))
      )
    );
  }

  constructor(
    private readonly auth: AngularFireAuth,
    private readonly router: Router,
    firestore: AngularFirestore
  ) {
    this.firestoreCollection = firestore.collection<UserDoc>('users');
    this.emailConsent$ = this.getEmailConsent$();
  }

  /**
   * Requires {@link firestoreCollection} to be initialised.
   * @returns - The value for {@link emailConsent$}.
   */
  private getEmailConsent$(): Observable<boolean | undefined> {
    return this.auth.user.pipe(
      switchMap(user => {
        if (!user) return of(undefined);
        return this.firestoreCollection.doc(user.uid).valueChanges().pipe(
          map(userDoc => userDoc?.consentToEmails)
        );
      }),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

}
