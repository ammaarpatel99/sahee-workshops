import {Injectable, OnDestroy} from '@angular/core';
import {AsyncSubject, Observable, of} from 'rxjs';
import {AdminWorkshop, AdminWorkshopDoc, FIRESTORE_PATHS as PATHS} from '@firebase-helpers';
import {UserService} from '../user/user.service';
import {AngularFirestore} from '@angular/fire/firestore';
import {distinctUntilChanged, first, map, shareReplay, switchMap, takeUntil} from 'rxjs/operators';


/**
 * A service for handling admin operations on workshops.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminWorkshopsService implements OnDestroy {
  /**
   * Used to store observables produced by {@link workshop$}.
   * Together with the usage of {@link shareReplay shareReplay(1)}, this reduces firestore requests.
   * @private
   */
  private readonly storedWorkshopObservables = new Map<string, Observable<Readonly<AdminWorkshop> | null>>();
  /**
   * Used to destroy long-lived or hot observables with the takeUntil structure when destroying component.
   * @private
   */
  private readonly destroy$ = new AsyncSubject<true>();


  /**
   * An observable that emits the workshop's admin data,
   * or null if there is no workshop (or the current user isn't an admin).
   * @param workshopID - The ID of the workshop.
   * @returns - An observable that never completes and re-emits on changes.
   */
  workshop$(workshopID: string): Observable<Readonly<AdminWorkshop> | null> {
    let obs$ = this.storedWorkshopObservables.get(workshopID);
    if (obs$) return obs$;

    obs$ = this.userService.userState$.pipe(
      map(userState => userState.isAdmin),
      distinctUntilChanged(),
      switchMap(isAdmin => {
        if (!isAdmin) return of(null);
        return this.firestore.doc<AdminWorkshopDoc>(PATHS.workshop.doc(workshopID))
          .valueChanges({idField: 'id'});
      }),
      map(workshop => {
        if (!workshop) return null;
        return {...workshop, jsDate: workshop.datetime.toDate()};
      }),
      takeUntil(this.destroy$),
      shareReplay(1),
      takeUntil(this.destroy$)
    );

    this.storedWorkshopObservables.set(workshopID, obs$);
    return obs$;
  }


  /**
   * An observable that creates a workshop and emits its ID.
   * @param data - The data for the workshop.
   * @returns - An observable that emits once and then completes.
   */
  create$(data: Readonly<AdminWorkshopDoc>): Observable<string> {
    return this.userService.userState$.pipe(
      first(),
      switchMap(isAdmin => {
        if (!isAdmin) throw new Error(`Can't create workshop as the user isn't an admin.`);
        return this.firestore.collection<AdminWorkshopDoc>(PATHS.workshop.col).add(data);
      }),
      map(doc => doc.id)
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


  constructor(
    private readonly userService: UserService,
    private readonly firestore: AngularFirestore
  ) { }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
