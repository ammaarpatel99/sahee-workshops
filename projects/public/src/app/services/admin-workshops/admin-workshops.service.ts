import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {AdminWorkshop, AdminWorkshopDoc, UserDoc, WorkshopUserDoc} from '../../../../../../functions/src/firebase-helpers/firestore-interfaces';
import {distinctUntilChanged, map, shareReplay, switchMap, take} from 'rxjs/operators';
import {combineLatest, from, Observable, of} from 'rxjs';
import {addJSDates, orderByDate} from '../../helpers/workshops';
import {AdminService} from '../admin/admin.service';

export interface WorkshopStats {
  totalUsers: number;
  users: number;
  consents: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminWorkshopsService {
  /**
   * {@link AngularFirestoreCollection} reference to the collection of workshops.
   */
  private readonly firestoreCollection: AngularFirestoreCollection<AdminWorkshopDoc>;
  /**
   * An observable that emits an array of all current {@link AdminWorkshop AdminWorkshops}, ordered by date with the earliest last.
   * The observable is based on {@link AngularFirestoreCollection#valueChanges}, and is multicast using {@link shareReplay shareReplay(1)}.
   * <br/>
   * If the user isn't an admin, as assessed by {@link AdminService#isAdmin$}, then an empty array is emitted.
   */
  public readonly workshops$: Observable<Readonly<AdminWorkshop>[]>;
  /**
   * An observable based on {@link workshops$}
   * that emits the workshops as a map from IDs to {@link AdminWorkshop} instances, rather than an array of the instances.
   */
  private readonly workshopsByID$: Observable<Map<string, Readonly<AdminWorkshop>>>;
  /**
   * A map of workshop IDs to observables created by {@link getWorkshop$},
   * which is used to prevent recreating observables for the same workshop, and therefore take full advantage
   * of multicasting the observables using {@link shareReplay shareReplay(1)}.
   */
  private readonly savedWorkshopObservables = new Map<string, Observable<Readonly<AdminWorkshop> | undefined>>();
  /**
   * The total number of users on the system. Used for {@link getWorkshopStats$}.
   * The observable is based on {@link AngularFirestoreCollection#valueChanges}, and is multicast using {@link shareReplay shareReplay(1)}
   */
  private readonly totalUsers$: Observable<number>;

  /**
   * Gets an observable for the workshop with the matching workshopID, and either emits its data or undefined.
   * The observable is based on {@link workshops$} but only emits when the workshop's data changes.
   * @param workshopID - The ID of the workshop to get.
   * @returns - An observable which gets the workshop data and emits every time it changes.
   * The observable is multicast using {@link shareReplay shareReplay(1)},
   * and the produced observables are stored so further requests for the same workshopID produce the exact same observable,
   * therefore taking full advantage of multicasting.
   */
  public getWorkshop$(workshopID: string): Observable<Readonly<AdminWorkshop>|undefined> {
    let obs$ = this.savedWorkshopObservables.get(workshopID);
    if (obs$) return obs$;
    obs$ = this.workshopsByID$.pipe(
      map(mapping => mapping.get(workshopID)),
      distinctUntilChanged((x, y) => {
        if (x === undefined || y === undefined) return x === y;
        let key: keyof AdminWorkshop;
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
   * Used to get registration stats regarding a workshop.
   * @param workshopID - The ID of the workshop.
   * @returns - An observable which when subscribed to gets the stats and emits them.
   * It emits on changes and never completes.
   */
  public getWorkshopStats$(workshopID: string): Observable<WorkshopStats | undefined> {
    return this.getWorkshop$(workshopID).pipe(
      switchMap(workshop => {
        if (!workshop) return of(workshop);
        const usersData$ = this.firestore.collection<WorkshopUserDoc>(`workshops/${workshop.id}/workshop-users`)
          .valueChanges().pipe(
            map(docs => ({
              users: docs.length,
              consents: docs.filter(doc => doc.consentToEmails).length
            }))
          );
        return combineLatest([this.totalUsers$, usersData$]).pipe(
          map(data => ({totalUsers: data[0], ...data[1]}))
        );
      }),
      distinctUntilChanged((x, y) =>
        x?.users === y?.users && x?.totalUsers === y?.totalUsers && x?.consents === y?.consents
      ),
      shareReplay(1)
    );
  }

  /**
   * Used to create a workshop and requires the current user to have admin privileges as assessed by {@link AdminService#isAdmin$}.
   * @param data - The data to be stored.
   * @returns - An observable that when subscribed to creates the workshop and then emits its ID.
   * The observable only emits once and then completes.
   */
  public createWorkshop$(data: AdminWorkshopDoc): Observable<string> {
    return this.adminService.isAdmin$.pipe(
      take(1),
      switchMap(isAdmin => {
        if (!isAdmin) throw new Error(`User isn't admin so can't create workshops.`);
        return from(this.firestoreCollection.add(data));
      }),
      map(doc => {
        return doc.id;
      })
    );
  }

  /**
   * Used to update a workshop and requires the current user to have admin privileges as assessed by {@link AdminService#isAdmin$}.
   * @param workshopID - The ID of the workshop to be updated.
   * @param data - The fields and values to be updated on the workshop.
   * @returns - An observable that when subscribed to updates the workshop. It only emits once and then completes.
   */
  public updateWorkshop$(workshopID: string, data: Partial<AdminWorkshopDoc>): Observable<void> {
    return this.adminService.isAdmin$.pipe(
      take(1),
      switchMap(isAdmin => {
        if (!isAdmin) throw new Error(`User isn't admin so can't edit workshops.`);
        return from(this.firestoreCollection.doc(workshopID).update(data));
      })
    );
  }

  /**
   * Used to delete a workshop and requires the current user to have admin privileges as assessed by {@link AdminService#isAdmin$}.
   * @param workshopID - The ID of the workshop to be deleted.
   * @returns - An observable that when subscribed to deletes the workshop. It only emits once and then completes.
   */
  public deleteWorkshop$(workshopID: string): Observable<void> {
    return this.adminService.isAdmin$.pipe(
      take(1),
      switchMap(isAdmin => {
        if (!isAdmin) throw new Error(`User isn't admin so can't delete workshops.`);
        return from(this.firestoreCollection.doc(workshopID).delete());
      })
    );
  }

  constructor(
    private readonly adminService: AdminService,
    private readonly firestore: AngularFirestore
  ) {
    this.totalUsers$ = this.getTotalUsers$();
    this.firestoreCollection = this.firestore.collection<AdminWorkshopDoc>('workshops');
    this.workshops$ = this.fetchWorkshops$();
    this.workshopsByID$ = this.getWorkshopsByID$();
  }

  /**
   * Requires {@link firestoreCollection} to be initialised.
   * @returns - The value for {@link workshops$}.
   */
  private fetchWorkshops$(): Observable<Readonly<AdminWorkshop>[]> {
    return this.adminService.isAdmin$.pipe(
      switchMap(isAdmin => {
        if (!isAdmin) return of([] as AdminWorkshop[]);
        return this.firestoreCollection.valueChanges({idField: 'id'});
      }),
      addJSDates(),
      orderByDate(),
      shareReplay(1)
    );
  }

  /**
   * Requires {@link workshops$} to be initialised.
   * @returns - The value for {@link getWorkshopsByID$}.
   */
  private getWorkshopsByID$(): Observable<Map<string, Readonly<AdminWorkshop>>> {
    return this.workshops$.pipe(
      map(workshops => {
        const mapping = new Map<string, Readonly<AdminWorkshop>>();
        for (const w of workshops) mapping.set(w.id, w);
        return mapping;
      }),
      shareReplay(1)
    );
  }

  /**
   * @returns - The value for {@link totalUsers$}.
   */
  private getTotalUsers$(): Observable<number> {
    return this.firestore.collection<UserDoc>('users').valueChanges().pipe(
      map(docs => docs.length),
      shareReplay(1)
    );
  }

}
