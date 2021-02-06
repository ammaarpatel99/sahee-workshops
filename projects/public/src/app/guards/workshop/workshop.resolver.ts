import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {EMPTY, from, Observable, of} from 'rxjs';
import {mapTo, switchMap, switchMapTo, take} from 'rxjs/operators';
import {Workshop} from '../../helpers/workshops';
import {UserWorkshopsService} from '../../services/user-workshops/user-workshops.service';

@Injectable({
  providedIn: 'root'
})
export class WorkshopResolver implements Resolve< Observable<Readonly<Workshop>> > {
  /**
   * Gets the workshop observable for the route.
   * If there is no workshop, redirects to /unknown.<br/>
   * The observable passed to the route will also redirect if there is no workshop.
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Observable<Readonly<Workshop>>> {
    const id = route.paramMap.get('id');
    const redirect$ = this.getRedirect$();
    if (!id) return redirect$;
    const workshop$ = this.userWorkshopsService.workshop$(id).pipe(
      switchMap(workshop => workshop ? of(workshop) : redirect$)
    );
    return workshop$.pipe(
      // Don't use first() as if there is no workshop there will be no emission so first() will error
      take(1),
      mapTo(workshop$)
    );
  }


  /**
   * Used to redirect to /unknown. It never emits and completes after the redirect.
   * @private
   */
  private getRedirect$(): Observable<never> {
    return from(
      this.router.navigateByUrl('/unknown')
    ).pipe(
      switchMapTo(EMPTY)
    );
  }


  constructor(
    private readonly router: Router,
    private readonly userWorkshopsService: UserWorkshopsService
  ) { }
}
