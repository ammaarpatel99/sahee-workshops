import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFireFunctions} from '@angular/fire/functions';
import {filter, map, switchMap, switchMapTo, take} from 'rxjs/operators';
import {from, Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly makeAdminFn = this.functions.httpsCallable<{uid: string}, void>('admin.makeAdmin');
  private readonly removeAdminFn = this.functions.httpsCallable<{uid: string}, void>('admin.removeAdmin');
  private readonly restoreAdminsFn = this.functions.httpsCallable<void, void>('admin.restoreCoreAdmins');

  private isAdmin$(): Observable<boolean> {
    return this.auth.user.pipe(
      switchMap(user => from(user?.getIdTokenResult() || of(undefined))),
      map(idToken => !!idToken?.claims?.admin)
    );
  }

  makeAdmin$(uid: string): Observable<void> {
    return this.isAdmin$().pipe(
      take(1),
      filter(isAdmin => isAdmin),
      switchMapTo(this.makeAdminFn({uid}))
    );
  }

  removeAdmin$(uid: string): Observable<void> {
    return this.isAdmin$().pipe(
      take(1),
      filter(isAdmin => isAdmin),
      switchMapTo(this.removeAdminFn({uid}))
    );
  }

  restoreAdmins$(): Observable<void> {
    return this.restoreAdminsFn();
  }

  constructor(
    private auth: AngularFireAuth,
    private functions: AngularFireFunctions
  ) { }
}
