import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {map, shareReplay, switchMap, take} from 'rxjs/operators';
import firebase from 'firebase/app';
import {from, Observable, of} from 'rxjs';
import {User, UserDoc} from '../../../../../../firestore-interfaces/users/user';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  readonly user$ = this.fetchUser$();
  readonly email$ = this.getEmail$();
  readonly emailConsent$ = this.getEmailConsent$();
  readonly emailVerified$ = this.getEmailVerified$();
  private _redirectUrl: string|undefined;

  get redirectUrl(): string {
    const url = this._redirectUrl;
    this._redirectUrl = undefined;
    return url || '';
  }

  async signIn(): Promise<void> {
    this._redirectUrl = this.router.url;
    await this.router.navigateByUrl('/login');
  }

  setEmailConsent$(consentToEmails: boolean): Observable<void> {
    return this.user$.pipe(
      take(1),
      switchMap(user => !user ? of(user) :
        from(this.firestore.doc<UserDoc>(`users/${user.uid}`).update({consentToEmails}))
      )
    );
  }

  sendEmailVerification$(): Observable<void> {
    return this.auth.user.pipe(
      take(1),
      switchMap(user => user ? from(user.sendEmailVerification()) : of(undefined))
    );
  }

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) { }

  private getEmailConsent$(): Observable<boolean|null|undefined> {
    return this.user$.pipe(
      map(user => user ? (user.consentToEmails || null) : undefined),
      shareReplay(1)
    );
  }

  private getEmail$(): Observable<string | null | undefined> {
    return this.user$.pipe(
      map(user => user?.email),
      shareReplay(1)
    );
  }

  private getEmailVerified$(): Observable<boolean | undefined> {
    return this.auth.user.pipe(
      map(user => user?.emailVerified),
      shareReplay(1)
    );
  }

  private fetchUser$(): Observable<User | undefined> {
    return this.auth.user.pipe(
      switchMap(user => user ? this.fetchUserData$(user) : of(undefined)),
      shareReplay(1)
    );
  }

  private fetchUserData$(user: firebase.User): Observable<User|undefined> {
    return this.firestore.doc<UserDoc>(`users/${user.uid}`).valueChanges({idField: 'id'});
  }
}
