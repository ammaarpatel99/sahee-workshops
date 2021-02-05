import {Injectable, OnDestroy} from '@angular/core';
import {combineLatest, Observable, of} from 'rxjs';
import {AdminWorkshopsService} from '../admin-workshops/admin-workshops.service';
import {AngularFirestore} from '@angular/fire/firestore';
import {WorkshopUserDoc, FIRESTORE_PATHS as PATHS, UserDoc} from '@firebase-helpers';
import {distinctUntilChanged, map, shareReplay, switchMap, takeUntil} from 'rxjs/operators';
import {CleanRxjs} from '../../helpers/clean-rxjs/clean-rxjs';


/**
 * Statistics regarding a specific workshop.
 */
export interface WorkshopStats {
  totalUsers: number;
  users: number;
  consents: number;
}


@Injectable({
  providedIn: 'root'
})
export class WorkshopStatsService extends CleanRxjs implements OnDestroy {
  /**
   * Used to store observables produced by {@link workshop$}.
   * Together with the usage of {@link shareReplay shareReplay(1)}, this reduces firestore requests.
   * @private
   */
  private readonly storedWorkshopObservables = new Map<string, Observable<Readonly<WorkshopStats> | null>>();
  /**
   * An observable that emits the total number of users on the system.
   * It never completes and emits on changes.
   * @private
   */
  private readonly totalUsers$ = this.getTotalUsers$();


  /**
   * An observable that emits stats on a workshop.
   * @param workshopID - The ID of the workshop.
   * @returns - An observable that never completes and emits on changes.
   */
  workshop$(workshopID: string): Observable<Readonly<WorkshopStats> | null> {
    // If observable already created, return it.
    let obs$ = this.storedWorkshopObservables.get(workshopID);
    if (obs$) return obs$;

    // otherwise create observable
    obs$ = this.adminWorkshopsService.workshop$(workshopID).pipe(
      switchMap(workshop => {
        if (!workshop) return of(null);
        return combineLatest([this.totalUsers$, this.getWorkshopUsers$(workshopID)]);
      }),
      map(data => {
        if (!data) return null;
        return {
          totalUsers: data[0],
          users: data[1].length,
          consents: data[1].filter(doc => doc.consentToEmails).length
        };
      }),
      distinctUntilChanged((x, y) => {
        return x?.users === y?.users && x?.totalUsers === y?.totalUsers && x?.consents === y?.consents;
      }),
      takeUntil(this.destroy$),
      shareReplay(1)
    );

    this.storedWorkshopObservables.set(workshopID, obs$);
    return obs$;
  }


  /**
   * An observable that emits the data on all users registered for a workshop.
   * @param workshopID - The ID of the workshop.
   * @returns - An observable that never completes and emits on changes.
   * @private
   */
  private getWorkshopUsers$(workshopID: string): Observable<WorkshopUserDoc[]> {
    return this.firestore
      .collection<WorkshopUserDoc>(PATHS.workshop.user.col(workshopID))
      .valueChanges()
      .pipe(
        takeUntil(this.destroy$)
      );
  }


  constructor(
    private readonly adminWorkshopsService: AdminWorkshopsService,
    private readonly firestore: AngularFirestore
  ) { super(); }


  /**
   * Provides the value for {@link getTotalUsers$}.
   * @private
   */
  private getTotalUsers$(): Observable<number> {
    return this.firestore
      .collection<UserDoc>(PATHS.user.col)
      .valueChanges()
      .pipe(
        map(docs => docs.length),
        takeUntil(this.destroy$),
        shareReplay(1)
      );
  }
}
