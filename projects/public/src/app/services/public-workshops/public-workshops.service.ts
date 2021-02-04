import {Injectable, OnDestroy} from '@angular/core';
import {AsyncSubject, Observable} from 'rxjs';
import {PublicWorkshop, PublicWorkshopDoc, FIRESTORE_PATHS as PATHS} from '@firebase-helpers';
import {AngularFirestore} from '@angular/fire/firestore';
import {addJSDates, orderByDate} from '../../helpers/workshops';
import {distinctUntilChanged, map, shareReplay, takeUntil} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PublicWorkshopsService implements OnDestroy {
  /**
   * An observable which emits all workshops by their public data.
   * The observable re-emits whenever any workshop's data changes.
   * It never completes.
   */
  readonly workshops$ = this.getWorkshops$();
  /**
   * Used to destroy long-lived or hot observables with the takeUntil structure when destroying component.
   * @private
   */
  private readonly destroy$ = new AsyncSubject<true>();
  /**
   * Used to store observables produced by {@link workshop$}.
   * Together with the usage of {@link shareReplay shareReplay(1)}, this reduces firestore requests.
   * @private
   */
  private readonly storedWorkshopObservables = new Map<string, Observable<Readonly<PublicWorkshop> | null>>();


  /**
   * An observable which emits the public data of a workshop, or null if the workshop doesn't exist.
   * It only re-emits when the data has changed, and it never completes.
   * @param workshopID - The ID of the workshop.
   * @returns - An observable which emits the data, re-emits on changes, and never completes.
   */
  workshop$(workshopID: string): Observable<PublicWorkshop | null> {
    let obs$ = this.storedWorkshopObservables.get(workshopID);
    if (obs$) return obs$;

    obs$ = this.workshops$.pipe(
      map(workshops => {
        workshops = workshops.filter(workshop => workshop.id === workshopID);
        if (workshops.length <= 0) return null;
        else return workshops[0];
      }),
      distinctUntilChanged((x, y) => {
        if (x === null || y === null) return x === y;
        return x.name === y.name
          && x.description === y.description
          && x.jsDate.getTime() === y.jsDate.getTime();
      }),
      takeUntil(this.destroy$),
      shareReplay(1),
      takeUntil(this.destroy$)
    );

    this.storedWorkshopObservables.set(workshopID, obs$);
    return obs$;
  }


  constructor(
    private readonly firestore: AngularFirestore
  ) { }


  /**
   * Provides the value for {@link workshops$}.
   * @private
   */
  private getWorkshops$(): Observable<Readonly<PublicWorkshop>[]> {
    return this.firestore
      .collection<PublicWorkshopDoc>(PATHS.publicWorkshop.col)
      .valueChanges({idField: 'id'})
      .pipe(
        addJSDates(),
        orderByDate(),
        takeUntil(this.destroy$),
        shareReplay(1),
        takeUntil(this.destroy$)
      );
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
