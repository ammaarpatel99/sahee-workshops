import {Injectable, OnDestroy} from '@angular/core';
import {forkJoin, Observable, of} from 'rxjs';
import {AdminWorkshop, AdminWorkshopDoc, FIRESTORE_PATHS as PATHS} from '@firebase-helpers';
import {UserService} from '../../../services/user/user.service';
import {AngularFirestore} from '@angular/fire/firestore';
import {filter, first, map, mapTo, shareReplay, switchMap, takeUntil} from 'rxjs/operators';
import {CleanRxjs} from '../../../helpers/clean-rxjs/clean-rxjs';
import {PublicWorkshopsService} from '../../../services/public-workshops/public-workshops.service';


/**
 * A service for handling admin operations on workshops.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminWorkshopsService extends CleanRxjs implements OnDestroy {
  /**
   * Used to store observables produced by {@link workshop$}.
   * Together with the usage of {@link shareReplay shareReplay(1)}, this reduces firestore requests.
   * @private
   */
  private readonly storedWorkshopObservables = new Map<string, Observable<Readonly<AdminWorkshop> | null>>();


  /**
   * An observable that emits the workshop's admin data,
   * or null if there is no workshop (or the current user isn't an admin).
   * @param workshopID - The ID of the workshop.
   * @returns - An observable that never completes and re-emits on changes.
   */
  workshop$(workshopID: string): Observable<Readonly<AdminWorkshop> | null> {
    // If observable already created, return it.
    let obs$ = this.storedWorkshopObservables.get(workshopID);
    if (obs$) return obs$;

    // otherwise create an observable
    obs$ = this.userService.isAdmin$.pipe(
      switchMap(isAdmin => {
        if (!isAdmin) return of(null);
        return this.firestore.doc<AdminWorkshopDoc>(PATHS.workshop.doc(workshopID))
          .valueChanges();
      }),
      map(workshop => {
        if (!workshop) return null;
        return {...workshop, jsDate: workshop.datetime.toDate(), id: workshopID};
      }),
      takeUntil(this.destroy$),
      shareReplay(1)
    );

    // store created observable and return it.
    this.storedWorkshopObservables.set(workshopID, obs$);
    return obs$;
  }


  /**
   * An observable that creates a workshop and emits its ID.
   * @param data - The data for the workshop.
   * @returns - An observable that emits once and then completes.
   */
  create$(data: Readonly<AdminWorkshopDoc>): Observable<string> {
    return this.userService.isAdmin$.pipe(
      first(),
      switchMap(isAdmin => {
        if (!isAdmin) throw new Error(`Can't create workshop as the user isn't an admin.`);
        const obs$ = this.firestore.collection<AdminWorkshopDoc>(PATHS.workshop.col).add(data);
        const waitForRes$ = this.waitForCreation$();
        return forkJoin([obs$, waitForRes$]);
      }),
      map(doc => doc[0].id)
    );
  }


  /**
   * An observable that updates a workshop.
   * @param workshopID - The ID of the workshop.
   * @param data - The updates to the data of the workshop.
   * @returns - An observable that emits once and then completes.
   */
  update$(workshopID: string, data: Readonly<Partial<AdminWorkshopDoc>>): Observable<void> {
    return this.workshop$(workshopID).pipe(
      first(),
      switchMap(workshop => {
        if (!workshop) throw new Error(`Can't update workshop as either it doesn't exist or the user isn't an admin.`);
        return this.firestore.doc<AdminWorkshopDoc>(PATHS.workshop.doc(workshopID)).update(data);
      })
    );
  }


  /**
   * An observable that deletes a workshop.
   * @param workshopID - The ID of the workshop.
   * @returns - An observable that emits once and then completes.
   */
  delete$(workshopID: string): Observable<void> {
    return this.workshop$(workshopID).pipe(
      first(),
      switchMap(workshop => {
        if (!workshop) throw new Error(`Can't delete workshop as either it doesn't exist or the user isn't an admin.`);
        return this.firestore.doc<AdminWorkshopDoc>(PATHS.workshop.doc(workshopID)).delete();
      })
    );
  }


  private waitForCreation$(): Observable<void> {
    return this.publicWorkshopsService.workshops$.pipe(
      filter((value, index) => index > 0),
      first(),
      mapTo(undefined)
    );
  }


  constructor(
    private readonly userService: UserService,
    private readonly firestore: AngularFirestore,
    private readonly publicWorkshopsService: PublicWorkshopsService
  ) { super(); }
}
