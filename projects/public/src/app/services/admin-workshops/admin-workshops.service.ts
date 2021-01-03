import {Injectable, OnDestroy} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {AdminWorkshop, AdminWorkshopDoc} from '../../../../../../firestore-interfaces/workshops/workshop';
import {map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {Observable, of, ReplaySubject, Subscription} from 'rxjs';
import {addJSDate, orderByDate} from '../../helpers/workshops';

@Injectable({
  providedIn: 'root'
})
export class AdminWorkshopsService implements OnDestroy {
  private readonly _workshops$ = new ReplaySubject<Readonly<AdminWorkshop>[]>(1);
  readonly workshops$ = this._workshops$.asObservable();
  private readonly workshopIndices$ = new ReplaySubject<Map<string, number>>(1);
  private readonly firestoreCollection = this.firestore.collection<AdminWorkshopDoc>('workshops');

  getWorkshop$(id: string): Observable<Readonly<AdminWorkshop>|undefined> {
    return this.workshopIndices$.pipe(
      map(indices => indices.get(id)),
      switchMap(index => {
        if (index === undefined) return of(undefined);
        return this.workshops$.pipe(map(workshops => workshops[index]));
      }),
      shareReplay(1)
    );
  }

  async createWorkshop(data: AdminWorkshopDoc): Promise<string> {
    const document = await this.firestoreCollection.add(data);
    return document.id;
  }

  async updateWorkshop(id: string, data: Partial<AdminWorkshopDoc>): Promise<void> {
    await this.firestoreCollection.doc(id).update(data);
  }

  async deleteWorkshop(id: string): Promise<void> {
    await this.firestoreCollection.doc(id).delete();
  }

  constructor(
    private readonly firestore: AngularFirestore
  ) {
    this.subscriptions.push(this.fetchWorkshops$().subscribe());
  }

  private fetchWorkshops$(): Observable<void> {
    return this.firestoreCollection.valueChanges({idField: 'id'}).pipe(
      addJSDate(),
      orderByDate(),
      tap((workshops: AdminWorkshop[]): void => {
        const indices = new Map<string, number>();
        for (let i = 0; i < workshops.length; i++) indices.set(workshops[i].id, i);
        this.workshopIndices$.next(indices);
        this._workshops$.next(workshops);
      }),
      map(_ => {})
    );
  }

  private readonly subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }
}
