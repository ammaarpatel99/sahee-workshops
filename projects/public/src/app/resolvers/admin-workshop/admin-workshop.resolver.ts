import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {EMPTY, Observable, of} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';
import {AdminWorkshopsService} from '../../services/admin-workshops/admin-workshops.service';
import {AdminWorkshop} from '../../../../../../firestore-interfaces';

@Injectable({
  providedIn: 'root'
})
export class AdminWorkshopResolver implements Resolve<Observable<Readonly<AdminWorkshop>>> {

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise< Observable<Readonly<AdminWorkshop>> > {
    const id = route.paramMap.get('id');
    const redirect$ = this.getRedirect$();
    if (!id) return redirect$;
    const workshop$ = this.adminWorkshopsService.getWorkshop$(id).pipe(
      switchMap(workshop => workshop ? of(workshop) : redirect$)
    );
    await workshop$.pipe(take(1)).toPromise();
    return workshop$;
  }

  constructor(
    private readonly router: Router,
    private readonly adminWorkshopsService: AdminWorkshopsService
  ) { }

  private getRedirect$(): Observable<never> {
    return of(undefined).pipe(
      switchMap(() => {
        this.router.navigateByUrl('admin/unknown').then();
        return EMPTY;
      })
    );
  }
}
