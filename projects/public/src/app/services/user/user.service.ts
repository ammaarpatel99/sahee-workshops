import {Injectable, OnDestroy} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {combineLatest, from, Observable, of} from 'rxjs';
import {distinctUntilChanged, map, shareReplay, switchMap, takeUntil} from 'rxjs/operators';
import {FIRESTORE_PATHS as PATHS, UserDoc} from '@firebase-helpers';
import firebase from 'firebase/app';
import {Router} from '@angular/router';
import {CleanRxjs} from '../../helpers/clean-rxjs/clean-rxjs';


/**
 * An enum for the possible states of the user,
 * encapsulating their signed in state and their email state.
 */
export enum SignedInState {
  NO_USER,
  NO_EMAIL,
  EMAIL_NOT_VERIFIED,
  CONSENT_NOT_SET,
  VALID
}


/**
 * Encapsulates the state of the user,
 * including their signed in state and their email state (together described by the field signedInState),
 * and whether they are an admin (isAdmin field).
 */
export interface UserState {
  readonly signedInState: SignedInState;
  readonly isAdmin: boolean;
}


/**
 * The url used to sign in.
 */
const SIGN_IN_URL = '/login';


/**
 * General use service regarding the current user.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService extends CleanRxjs implements OnDestroy {
  /**
   * An observable which emits the state of the user.
   * It never completes and may emit multiple times.
   * <br/>
   * The admin state only updates on receiving a new idToken.
   * This is either via logging in, or by force fetching a token (through {@link AngularFireAuth} library).
   */
  readonly userState$ = this.getUserState$();
  /**
   * A url to redirect to after signing in.
   * @private
   */
  private _redirectUrl: string | null = null;


  /**
   * An observable which emits whether the current user is an admin.
   * It never completes and emits on changes.<br/>
   * It is based off {@link userState$}.
   */
  get isAdmin$(): Observable<boolean> {
    return this.userState$.pipe(
      map(userState => userState.isAdmin),
      distinctUntilChanged()
    );
  }


  /**
   * The url to redirect to after signing in (stored by {@link signIn$} or {@link signInUrl}).
   * @param clear - Whether to clear the stored url after getting it (defaults to true).
   * @param defaultUrl - The url to return if there is no stored url (defaults to the base url).
   * @returns - The stored url or the defaultUrl.
   */
  redirectUrl(clear?: boolean, defaultUrl?: string): string;
  /**
   * The url to redirect to after signing in (stored by {@link signIn$} or {@link signInUrl}).
   * @param clear - Whether to clear the stored url after getting it (defaults to true).
   * @param defaultUrl - The url to return if there is no stored url (defaults to the base url).
   * @returns - The stored url or the defaultUrl.
   */
  redirectUrl(clear?: boolean, defaultUrl?: string | null): string | null;
  redirectUrl(clear: boolean = true, defaultUrl: string | null = '/'): string | null {
    const redirectUrl = this._redirectUrl || defaultUrl;
    if (clear) this._redirectUrl = null;
    return redirectUrl;
  }


  /**
   * An observable which redirects to the sign in page, whilst storing a url to return to.
   * @param redirectUrl - The url to redirect to after signing in.
   * If missing the current url will be got from the router to redirect to.
   * @returns - An observable which only emits once and then completes.
   */
  signIn$(redirectUrl?: string): Observable<void> {
    this._redirectUrl = redirectUrl || this.router.url;
    return from(this.router.navigateByUrl(SIGN_IN_URL)).pipe(
      map(res => {
        if (!res) {
          this._redirectUrl = null;
          throw new Error(`Couldn't redirect to login page to sign in.`);
        }
      })
    );
  }


  /**
   * Returns the url used to sign in, whilst storing a url to return to.
   * @param redirectUrl - The url to redirect to after signing in.
   * If missing the current url will be got from the router to redirect to.
   * @returns - The url of the sign in page.
   */
  signInUrl(redirectUrl?: string): string {
    this._redirectUrl = redirectUrl || this.router.url;
    return SIGN_IN_URL;
  }


  /**
   * An observable which redirect to a previously stored url (stored by either {@link signIn$} or {@link signInUrl}),
   * whilst clearing the stored url.
   * @returns - An observable that emits once and then completes.
   */
  signedIn$(): Observable<void> {
    const redirectUrl = this.redirectUrl();
    return from(this.router.navigateByUrl(redirectUrl || '/')).pipe(
      map(res => {
        if (!res) {
          if (redirectUrl) this._redirectUrl = redirectUrl;
          throw new Error(`Couldn't redirect after signing in.`);
        }
      })
    );
  }


  /**
   * An observable which redirects to the sign in page if the current route requires the user to be signed in.
   * <br/>
   * Redirects using {@link signIn$ signIn$()}.
   * Currently the routes that require sign in are anything starting with /admin or /account.
   * @returns - An observable which emits once and then completes.
   */
  signedOut$(): Observable<void> {
    return new Observable<void>(subscriber => {
      const url = this.router.url;
      const protectedRoute = url.startsWith('/admin') || url.startsWith('/account');
      const obs$ = protectedRoute ? this.signIn$() : of(undefined);
      return obs$.subscribe(subscriber);
    });
  }


  constructor(
    private readonly auth: AngularFireAuth,
    private readonly firestore: AngularFirestore,
    private readonly router: Router
  ) { super(); }


  /**
   * Provides the value for {@link userState$}.
   * @private
   */
  private getUserState$(): Observable<Readonly<UserState>> {
    return this.auth.user.pipe(
      switchMap(user => {
        // If there is no user, return no user and not admin
        if (!user) return of([SignedInState.NO_USER, false] as [SignedInState, boolean]);
        // get user state
        let state;
        if (!user.email) state = of(SignedInState.NO_EMAIL);
        else if (!user.emailVerified) state = of(SignedInState.EMAIL_NOT_VERIFIED);
        else {
          // figure out if they have consented to emails in order to set the state
          state = this.getConsentSet$(user.uid).pipe(
            map(consentSet => {
              if (consentSet) return SignedInState.VALID;
              return SignedInState.CONSENT_NOT_SET;
            })
          );
        }
        // check if the user is an admin
        const isAdmin$ = this.getIsAdmin$(user);
        // return state and isAdmin$ together
        return combineLatest([state, isAdmin$]);
      }),
      map(([signedInState, isAdmin]) => ({signedInState, isAdmin})),
      takeUntil(this.destroy$),
      shareReplay(1)
    );
  }


  /**
   * Given a firebase user, provides an observable which emits whether they are an admin.
   * @param user - The firebase user, as produced by {@link AngularFireAuth#user}.
   * @returns - An observable which never completes and can emit multiple times.
   * @private
   */
  private getIsAdmin$(user: firebase.User): Observable<boolean> {
    return from(user.getIdTokenResult()).pipe(
      map(idTokenResult => idTokenResult.claims.admin === true),
      takeUntil(this.destroy$)
    );
  }


  /**
   * Given a user's id, provides an observable which emits whether they have set their consent to general emails.
   * @param userID - The id of the user.
   * @returns - An observable which never completes and can emit multiple times.
   * @private
   */
  private getConsentSet$(userID: string): Observable<boolean> {
    return this.firestore.doc<UserDoc>(PATHS.user.doc(userID))
      .valueChanges()
      .pipe(
        map(userDoc => userDoc?.consentToEmails === true || userDoc?.consentToEmails === false),
        takeUntil(this.destroy$)
      );
  }
}
