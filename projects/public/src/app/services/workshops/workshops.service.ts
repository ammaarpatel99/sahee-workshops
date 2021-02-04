import {Injectable} from '@angular/core';
import {combineLatest, Observable, of} from 'rxjs';
import {UserWorkshop, UserWorkshopDoc, PublicWorkshop, PublicWorkshopDoc} from '../../../../../../functions/src/firebase-helpers/firestore-interfaces';
import {distinctUntilChanged, map, shareReplay, switchMap, switchMapTo, take} from 'rxjs/operators';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {addJSDates, isUserWorkshop, orderByDate, Workshop} from '../../helpers/workshops';
import {AngularFireAuth} from '@angular/fire/auth';
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import {FirebaseFunctionsService} from '../firebase-functions/firebase-functions.service';

@Injectable({
  providedIn: 'root'
})
export class WorkshopsService {

  /**
   * {@link AngularFirestoreCollection} reference to the collection of public workshops.
   */
  private readonly publicWorkshopCollection: AngularFirestoreCollection<PublicWorkshopDoc>;
  /**
   * An observable that emits an array of all current {@link Workshop Workshops}, ordered by date with the earliest last.
   * The observable is based on {@link AngularFirestoreCollection#valueChanges}, and is multicast using {@link shareReplay shareReplay(1)}.
   * <br/>
   * If the user has registered for a workshop, their data on the workshop replaces the public data on the workshop.
   */
  public readonly workshops$: Observable<Readonly<Workshop>[]>;
  /**
   * An observable based on {@link workshops$}
   * that emits the workshops as a map from IDs to {@link Workshop} instances, rather than an array of the instances.
   */
  private readonly workshopsByID$: Observable<Map<string, Readonly<Workshop>>>;
  /**
   * A map of workshop IDs to observables created by {@link getWorkshop$},
   * which is used to prevent recreating observables for the same workshop, and therefore take full advantage
   * of multicasting the observables using {@link shareReplay shareReplay(1)}.
   */
  private readonly savedWorkshopObservables = new Map<string, Observable<Readonly<Workshop>|undefined>>();

  /**
   * Gets an observable for the workshop with the matching workshopID, and either emits its data or undefined.
   * The observable is based on {@link workshops$} but only emits when the workshop's data changes.
   * @param workshopID - The ID of the workshop to get.
   * @returns - An observable which gets the workshop data and emits every time it changes.
   * The observable is multicast using {@link shareReplay shareReplay(1)},
   * and the produced observables are stored so further requests for the same workshopID produce the exact same observable,
   * therefore taking full advantage of multicasting.
   */
  public getWorkshop$(workshopID: string): Observable<Readonly<Workshop> | undefined> {
    let obs$ = this.savedWorkshopObservables.get(workshopID);
    if (obs$) return obs$;
    obs$ = this.workshopsByID$.pipe(
      map(mapping => mapping.get(workshopID)),
      distinctUntilChanged((x, y) => {
        if (x === undefined || y === undefined) return x === y;
        let key: keyof Workshop;
        for (key in x) if (x.hasOwnProperty(key) && x[key] !== y[key]) return false;
        for (key in y) if (y.hasOwnProperty(key) && x[key] !== y[key]) return false;
        return true;
      }),
      shareReplay(1)
    );
    this.savedWorkshopObservables.set(workshopID, obs$);
    return obs$;
  }

  /**
   * Used to register a user for a workshop.
   * <br/>
   * Requires there to be a user logged in, for a workshop to have the provided workshopID,
   * and for the user to not already be registered for the workshop.
   * @param workshopID - The ID of the workshop.
   * @param consentToEmails - Whether or not the user consents to emails about this workshops.
   * @returns - An observable which when subscribed to registers the user for the workshop.
   * The observable only emits once and then completes.
   */
  public register$(workshopID: string, consentToEmails: boolean): Observable<void> {
    return this.getWorkshop$(workshopID).pipe(
      take(1),
      map(workshop => {
        if (!workshop) throw new Error(`Can't register for workshop as it doesn't exist.`);
        if (isUserWorkshop(workshop)) throw new Error(`User is already registered for workshop.`);
      }),
      switchMapTo(this.auth.user),
      take(1),
      map(user => {
        if (!user) throw new Error(`Can't register for workshop as no user logged in.`);
      }),
      switchMap(() => this.functions.register$(workshopID, consentToEmails))
    );
  }

  /**
   * Used to change a users consent to emails for a workshop.
   * <br/>
   * Requires there to be a user logged in, for a workshop to have the provided workshopID,
   * and for the user to be registered for the workshop.
   * @param workshopID - The ID of the workshop.
   * @param consentToEmails - Whether or not the user consents to emails about this workshops.
   * @returns - An observable which when subscribed to changes the users consent to emails for the workshop.
   * The observable only emits once and then completes.
   */
  public changeConsent$(workshopID: string, consentToEmails: boolean): Observable<void> {
    return this.getWorkshop$(workshopID).pipe(
      take(1),
      map(workshop => {
        if (!workshop) throw new Error(`Can't change workshop email consent as workshop doesn't exist.`);
        if (!isUserWorkshop(workshop)) throw new Error(`Can't change workshop email consent as user isn't registered for it.`);
      }),
      switchMapTo(this.auth.user),
      take(1),
      map(user => {
        if (!user) throw new Error(`Can't change workshop email consent as no user logged in.`); // should never be true
        return user.uid;
      }),
      switchMap(uid => this.userWorkshopCollection(uid).doc(workshopID).update({consentToEmails}))
    );
  }

  /**
   * Used to unregister a user for a workshop.
   * <br/>
   * Requires there to be a user logged in, for a workshop to have the provided workshopID,
   * and for the user to not already be registered for the workshop.
   * @param workshopID - The ID of the workshop.
   * @returns - An observable which when subscribed to unregisters the user for the workshop.
   * The observable only emits once and then completes.
   */
  public unregister$(workshopID: string): Observable<void> {
    return this.getWorkshop$(workshopID).pipe(
      take(1),
      map(workshop => {
        if (!workshop) throw new Error(`Can't unregister from workshop as workshop doesn't exist.`);
        if (!isUserWorkshop(workshop)) throw new Error(`Can't unregister from workshop as user isn't registered for it.`);
      }),
      switchMapTo(this.auth.user),
      take(1),
      map(user => {
        if (!user) throw new Error(`Can't unregister from workshop as no user logged in.`); // should never be true
        return user.uid;
      }),
      switchMap(uid => this.userWorkshopCollection(uid).doc(workshopID).delete())
    );
  }

  constructor(
    private readonly firestore: AngularFirestore,
    private readonly auth: AngularFireAuth,
    private readonly functions: FirebaseFunctionsService
  ) {
    this.publicWorkshopCollection = this.firestore.collection<PublicWorkshopDoc>('public-workshops');
    this.workshops$ = this.fetchWorkshops$();
    this.workshopsByID$ = this.getWorkshopsByID$();
  }

  /**
   * Requires {@link publicWorkshopCollection} to be initialised.
   * @returns - The value for {@link workshops$}.
   */
  private fetchWorkshops$(): Observable<Readonly<Workshop>[]> {
    return combineLatest([
      this.fetchPublicWorkshops$(),
      this.fetchUserWorkshops$()
    ]).pipe(
      map(data => WorkshopsService.combinePublicAndUserWorkshops(...data)),
      shareReplay(1)
    );
  }

  /**
   * Helper function for {@link fetchWorkshops$}.
   */
  private static combinePublicAndUserWorkshops(
    publicWorkshops: Readonly<PublicWorkshop>[], userWorkshops: Readonly<UserWorkshop>[]
  ): Readonly<Workshop>[] {
    const data: Readonly<Workshop>[] = [];
    for (let i = 0, j = 0; i < publicWorkshops.length || j < userWorkshops.length; i++, j++) {
      if (i >= publicWorkshops.length) data.push(userWorkshops[j]);
      else if (j >= userWorkshops.length) data.push(publicWorkshops[i]);
      else if (publicWorkshops[i].id === userWorkshops[j].id) data.push(userWorkshops[j]);
      else {
        data.push(publicWorkshops[i]);
        j--;
      }
    }
    return data;
  }

  /**
   * Requires {@link workshops$} to be initialised.
   * @returns - The value fro {@link workshopsByID$}.
   */
  private getWorkshopsByID$(): Observable<Map< string, Readonly<Workshop> >> {
    return this.workshops$.pipe(
      map(workshops => {
        const mapping = new Map<string, Readonly<PublicWorkshop | UserWorkshop>>();
        for (const w of workshops) mapping.set(w.id, w);
        return mapping;
      }),
      shareReplay(1)
    );
  }

  /**
   * @returns - An observable which fetches {@link PublicWorkshop PublicWorkshops}
   * using {@link AngularFirestoreCollection#valueChanges}, and returns then ordered by date,
   * with the earliest last.
   */
  private fetchPublicWorkshops$(): Observable<Readonly<PublicWorkshop>[]> {
    return this.publicWorkshopCollection.valueChanges({idField: 'id'}).pipe(
      addJSDates(),
      orderByDate()
    );
  }

  /**
   * If there is no user the returned observable emits an empty array,
   * otherwise it emits an array of {@link UserWorkshop UserWorkshops} including all workshops the user is registered for.
   * @returns - An observable which fetches {@link UserWorkshop UserWorkshops}
   * using {@link AngularFirestoreCollection#valueChanges}, and returns then ordered by date,
   * with the earliest last.
   */
  private fetchUserWorkshops$(): Observable<Readonly<UserWorkshop>[]> {
    const fetchFn$ = (uid: string) =>
      this.userWorkshopCollection(uid).valueChanges({idField: 'id'})
        .pipe(
          /*
          The below mapping is because when a user signs up for a workshop
          the user-workshop is created but in the moment before the firebase function runs
          the data about the workshop isn't present.
          */
          map(workshops => workshops.map(w => {
            if (!!w.datetime) return w;
            const date = new Date();
            const _w: UserWorkshop = {
              datetime: Timestamp.fromDate(date),
              consentToEmails: w.consentToEmails,
              name: 'Loading...',
              description: 'Loading...',
              jsDate: date,
              id: w.id
            };
            return _w;
          })),
          addJSDates(),
          orderByDate()
        );
    return this.auth.user.pipe(
      switchMap(user => user ? fetchFn$(user.uid) : of([]))
    );
  }

  /**
   * Gets the workshops a user is registered for.
   * @param uid - The uid of the user.
   * @returns - An {@link AngularFirestoreCollection} reference to the collection of user workshops for the user.
   */
  private userWorkshopCollection(uid: string): AngularFirestoreCollection<UserWorkshopDoc> {
    return this.firestore.collection(`users/${uid}/user-workshops`);
  }

}
