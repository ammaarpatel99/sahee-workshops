import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {
  PublicWorkshop,
  PublicWorkshopDoc,
  FIRESTORE_PATHS as PATHS
} from '@firebase-helpers';
import {AngularFirestore} from '@angular/fire/firestore';
import {addJSDates, orderByDate} from '../../helpers/workshops';
import {distinctUntilChanged, map, shareReplay} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PublicWorkshopsService {
  /**
   * An observable which emits all workshops by their public data.
   * The observable re-emits whenever any workshop's data changes.
   * It never completes.
   */
  readonly workshops$ = this.getWorkshops$();


  /**
   * An observable which emits the public data of a workshop, or null if the workshop doesn't exist.
   * It only re-emits when the data has changed, and it never completes.
   * @param workshopID - The ID of the workshop.
   * @returns - An observable which emits the data, re-emits on changes, and never completes.
   */
  workshop$(workshopID: string): Observable<PublicWorkshop | null> {
    return this.workshops$.pipe(
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
      })
    );
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
        shareReplay(1)
      );
  }
}
