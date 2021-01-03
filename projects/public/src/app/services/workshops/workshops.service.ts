import {Injectable, OnDestroy} from '@angular/core';
import {combineLatest, Observable, of, ReplaySubject, Subscription} from 'rxjs';
import {UserWorkshop} from '../../../../../../firestore-interfaces/users/user-workshops/user-workshop';
import {PublicWorkshop, PublicWorkshopDoc} from '../../../../../../firestore-interfaces/public-workshops/public-workshop';
import {map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {addJSDate, orderByDate} from '../../helpers/workshops';
import {UserWorkshopsService} from '../user-workshops/user-workshops.service';

@Injectable({
  providedIn: 'root'
})
export class WorkshopsService implements OnDestroy {
  private readonly _workshops$ = new ReplaySubject<Readonly<UserWorkshop|PublicWorkshop>[]>(1);
  readonly workshops$ = this._workshops$.asObservable();
  private readonly workshopIndices$ = new ReplaySubject<Map<string, number>>(1);

  getWorkshop$(id: string): Observable<Readonly<UserWorkshop|PublicWorkshop> | undefined> {
    return this.workshopIndices$.pipe(
      map(indices => indices.get(id)),
      switchMap(index => {
        if (index === undefined) return of(undefined);
        return this.workshops$.pipe(map(workshops => workshops[index]));
      }),
      shareReplay(1)
    );
  }

  constructor(
    private firestore: AngularFirestore,
    private userWorkshopsService: UserWorkshopsService
  ) {
    this.subscriptions.push(this.fetchWorkshops$().subscribe());
  }

  private fetchWorkshops$(): Observable<void> {
    const publicWorkshops$: Observable<PublicWorkshop[]> =
      this.getCollection().valueChanges({idField: 'id'}).pipe(addJSDate(), orderByDate());
    const userWorkshops$ = this.userWorkshopsService.workshops$;
    return combineLatest([publicWorkshops$, userWorkshops$]).pipe(
      map(([publicWorkshops, userWorkshops]) => {
        const data: Readonly<PublicWorkshop|UserWorkshop>[] = [];
        let i = 0;
        let j = 0;
        while (i < publicWorkshops.length || j < userWorkshops.length) {
          if (i >= publicWorkshops.length) {
            data.push(userWorkshops[j]);
            j++;
          } else if (j >= userWorkshops.length) {
            data.push(publicWorkshops[i]);
            i++;
          } else if (publicWorkshops[i].id === userWorkshops[j].id) {
            data.push(userWorkshops[j]);
            i++;
            j++;
          } else {
            data.push(publicWorkshops[i]);
            i++;
          }
        }
        return data;
      }),
      map(w => {
        const indices = new Map<string, number>();
        for (let i = 0; i < w.length; i++) indices.set(w[i].id, i);
        this.workshopIndices$.next(indices);
        this._workshops$.next(w);
      })
    );
  }

  private getCollection(): AngularFirestoreCollection<PublicWorkshopDoc> {
    return this.firestore.collection<PublicWorkshopDoc>(`public-workshops`);
  }

  private subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
