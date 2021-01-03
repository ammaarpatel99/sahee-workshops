import {Injectable, OnDestroy} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {UserWorkshop, UserWorkshopDoc} from '../../../../../../firestore-interfaces/users/user-workshops/user-workshop';
import {from, Observable, of, ReplaySubject, Subscription} from 'rxjs';
import {filter, map, shareReplay, switchMap, switchMapTo, take, tap} from 'rxjs/operators';
import firebase from 'firebase/app';
import {addJSDate, orderByDate} from '../../helpers/workshops';
import {AngularFireFunctions} from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class UserWorkshopsService implements OnDestroy {
  private readonly _workshops$ = new ReplaySubject<Readonly<UserWorkshop>[]>(1);
  readonly workshops$ = this._workshops$.asObservable();
  private readonly workshopIndices$ = new ReplaySubject<Map<string, number>>(1);
  private readonly registerFn =
    this.functions.httpsCallable<{ uid: string, workshopID: string, consentToEmails: boolean }, void>('workshop.register');
  private readonly unregisterFn = this.functions.httpsCallable<{uid: string, workshopID: string}, void>('workshop.unregister');
  private readonly changeConsentFn =
    this.functions.httpsCallable<{ uid: string, workshopID: string, consentToEmails: boolean }, void>('workshop.changeConsent');

  getWorkshop$(id: string): Observable<Readonly<UserWorkshop> | undefined> {
    return this.workshopIndices$.pipe(
      map(indices => indices.get(id)),
      switchMap(index => {
        if (!index) return of(undefined);
        return this.workshops$.pipe(map(workshops => workshops[index]));
      }),
      shareReplay(1)
    );
  }

  updateConsentToEmails$(id: string, consent: boolean): Observable<void> {
    return this.getWorkshop$(id).pipe(
      take(1),
      filter(workshop => !!workshop && workshop.consentToEmails !== consent),
      switchMapTo(from(this.auth.currentUser)),
      filter(user => !!user),
      map(user => (user as firebase.User).uid),
      switchMap(uid => from(this.changeConsentFn({uid, workshopID: id, consentToEmails: consent})))
    );
  }

  register$(workshopID: string, consentToEmails: boolean): Observable<void> {
    return this.getWorkshop$(workshopID).pipe(
      take(1),
      filter(workshop => !!workshop && workshop.consentToEmails !== consentToEmails),
      switchMapTo(from(this.auth.currentUser)),
      filter(user => !!user),
      map(user => (user as firebase.User).uid),
      switchMap(uid => from(this.registerFn({uid, workshopID, consentToEmails})))
    );
  }

  unregister$(workshopID: string): Observable<void> {
    return this.getWorkshop$(workshopID).pipe(
      take(1),
      filter(workshop => !!workshop),
      switchMapTo(from(this.auth.currentUser)),
      filter(user => !!user),
      map(user => (user as firebase.User).uid),
      switchMap(uid => from(this.unregisterFn({uid, workshopID})))
    );
  }

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private functions: AngularFireFunctions
  ) {
    this.subscriptions.push(this.fetchWorkshops$().subscribe());
  }

  private fetchWorkshops$(): Observable<void> {
    return this.auth.user.pipe(
      tap(user => {
        if (!user) {
          this._workshops$.next([]);
          this.workshopIndices$.next(new Map());
        }
      }),
      filter(user => !!user),
      map(user => (user as firebase.User).uid),
      switchMap(uid => this.getCollection(uid).valueChanges({idField: 'id'})),
      addJSDate(),
      orderByDate(),
      tap(workshops => {
        const indices = new Map<string, number>();
        for (let i = 0; i < workshops.length; i++) indices.set(workshops[i].id, i);
        this.workshopIndices$.next(indices);
        this._workshops$.next(workshops);
      }),
      map(_ => {})
    );
  }

  private getCollection(uid: string): AngularFirestoreCollection<UserWorkshopDoc> {
    return this.firestore.collection<UserWorkshopDoc>(`users/${uid}/user-workshops`);
  }

  private subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
